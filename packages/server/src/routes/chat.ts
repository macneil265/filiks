import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamText as aiStreamText, stepCountIs } from "ai";
import { db } from "@filiks/database/client";
import { Mode, MessageStatus } from "@filiks/database/enums";
import type { Prisma } from "@filiks/database";
import {
  type ChatStreamEvent,
  type messagePart,
  toolCallArgsSchema,
  messagePartsSchema,
  FREE_MODEL_PRIORITY,
} from "@filiks/shared";
import { createTools } from "../tools";
import { buildSystemPrompt } from "../system-prompt";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";
import type { AuthenticatedEnv } from "../../middleware/require-auth";


const submitSchema = z.object({
  content: z.string().min(1),
  mode: z.enum(Mode),
  model: z.string().refine(isSupportedChatModel, "Unsupported model"),
});

const submitValidator = zValidator("json", submitSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

// Process-local lock. Single-instance only — replace with DB/Redis lock before scaling horizontally.
const activeSessionIds = new Set<string>();
const MAX_STREAM_MS = 120_000;
const MAX_TOOL_MESSAGES = 15;

// Recursively strip undefined values to satisfy AI SDK v7's strict jsonValueSchema
function sanitizeJsonValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        result[key] = sanitizeJsonValue(v);
      }
    }
    return result;
  }
  return value;
}

// Rehydrate JSON-stringified tool results back to their original object/array form
function rehydrateResult(result: string): unknown {
  if (result.length === 0) return result;
  const first = result[0];
  if (first !== "{" && first !== "[") return result;
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
}

// Wrap a tool output value into the { type, value } format AI SDK v7 expects
function formatToolOutput(result: unknown): { type: string; value: unknown } {
  if (typeof result === "string") return { type: "text", value: result };
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    return { type: "json", value: result };
  }
  return { type: "text", value: JSON.stringify(result) };
}

function trimToolHistory(messages: HistoryMessage[]): HistoryMessage[] {
  let count = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    if (msg.role === "tool" || (msg.role === "assistant" && typeof msg.content !== "string")) {
      count++;
      if (count > MAX_TOOL_MESSAGES) {
        let start = i;
        while (start >= 0 && messages[start]!.role !== "assistant") {
          start--;
        }
        if (start < 0) start = i;

        let end = start + 1;
        while (end < messages.length && messages[end]!.role === "tool") {
          end++;
        }

        if (start > 0 && messages[start - 1]!.role === "user") {
          start--;
        }

        return [
          ...messages.slice(0, start),
          ...messages.slice(end),
        ];
      }
    }
  }

  return messages;
}

function buildConversationHistory(
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    content: string;
    status: MessageStatus;
    parts?: Prisma.JsonValue | null;
  }[],
) {
  const result: HistoryMessage[] = [];
  let lastRole: "user" | "assistant" | "tool" | null = null;

  for (const m of messages) {
    if (m.role === "ERROR") continue;

    if (m.role === "USER") {
      if (lastRole === "user") {
        const last = result[result.length - 1] as Extract<HistoryMessage, { role: "user" }>;
        last.content += "\n\n" + m.content;
        continue;
      }
      result.push({ role: "user", content: m.content });
      lastRole = "user";
      continue;
    }

    if (m.content.length === 0 && (!m.parts || !Array.isArray(m.parts) || m.parts.length === 0)) {
      continue;
    }

    // Guard: consecutive assistant messages after ERROR skip are invalid
    if (lastRole === "assistant") {
      continue;
    }

    const parts = m.parts ? messagePartsSchema.parse(m.parts) : [];
    const toolCalls = parts
      .filter(
        (p): p is Extract<messagePart, { type: "tool-call" }> => p.type === "tool-call",
      )
      .filter((tc) => tc.id && tc.name);
    const textParts = parts.filter(
      (p): p is Extract<messagePart, { type: "text" }> => p.type === "text",
    );

    if (toolCalls.length === 0) {
      result.push({ role: "assistant", content: m.content });
      lastRole = "assistant";
      continue;
    }

    const assistantContent: Array<Record<string, unknown>> = [];
    if (textParts.length > 0) {
      assistantContent.push({ type: "text", text: textParts.map((t) => t.text).join("") });
    }
    for (const tc of toolCalls) {
      assistantContent.push({
        type: "tool-call",
        toolCallId: tc.id,
        toolName: tc.name,
        input: sanitizeJsonValue(tc.args),
      });
    }

    result.push({ role: "assistant", content: assistantContent });
    lastRole = "assistant";

    for (const tc of toolCalls) {
      if (tc.result != null) {
        result.push({
          role: "tool",
          content: [{
            type: "tool-result",
            toolCallId: tc.id,
            toolName: tc.name,
            input: sanitizeJsonValue(tc.args),
            output: formatToolOutput(rehydrateResult(tc.result)),
          }],
        });
        lastRole = "tool";
      }
    }
  }

  return trimToolHistory(result);
};

function getResumableUserMessage(
  messages: {role: "USER" | "ASSISTANT" | "ERROR";
    model: string; mode: Mode
   } [],
) {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "USER") {
    return null;
  }
  return lastMessage;
}


type HistoryMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | Array<Record<string, unknown>> }
  | { role: "tool"; content: Array<Record<string, unknown>> };

type StreamParams = {
  sessionId: string;
  model: string;
  cwd: string | null;
  history: HistoryMessage[];
  mode: Mode;
  abortController: AbortController;
  modelPriority: string[];
};

const RETRYABLE_ERROR_PATTERNS = [
  "Upstream request failed",
  "ResourceExhausted",
  "Streaming response failed",
  "rate limit",
  "rate_limit",
  "429",
];

function isRetryableUpstreamError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return RETRYABLE_ERROR_PATTERNS.some((p) => msg.includes(p));
}

async function streamAIResponse(
  stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
  params: StreamParams,
) {
  const { sessionId, model, cwd, history, mode, abortController, modelPriority } = params;
  const startTime = Date.now();
  const tools = cwd ? createTools(cwd, mode) : undefined;
  const parts: messagePart[] = [];

  // Guard against stalled provider responses — deadline extends on each stream part
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  function resetStallTimeout() {
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(() => abortController.abort(), MAX_STREAM_MS);
  }
  resetStallTimeout();

  const persistInterruptedMessage = async () => {
    const fullText = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");

      if (fullText.length === 0 && parts.length === 0) {
        return;
      }
    
    const elapsedMs = Date.now() - startTime;
    const validatedParts: Prisma.InputJsonValue | undefined = parts.length > 0 ? messagePartsSchema.parse(parts) : undefined;
    

    await db.message.create({
      data: {
        SessionId: sessionId,
        role: "ASSISTANT",
        status: MessageStatus.INTERRUPTED,
        model: usedModel,
        content: fullText,
        parts: validatedParts,
        mode,
        duration: Math.round(elapsedMs / 1000),
      },
    });
  };

  const defaultIndex = modelPriority.indexOf(model);
  const triedModels = defaultIndex >= 0
    ? modelPriority.slice(defaultIndex)
    : [model, ...modelPriority.filter((m) => m !== model)];

  let lastError: unknown;
  let usedModel = model;

  try {
    for (const [i, candidateModel] of triedModels.entries()) {
      if (i > 0) {
        await new Promise(r => setTimeout(r, i * 1000));
      }
      try {
        const resolvedModel = resolveChatModel(candidateModel);
        usedModel = candidateModel;
        parts.length = 0;

        if (i > 0) {
          const resetEvent: ChatStreamEvent = { type: "reset" };
          await stream.writeSSE({ event: "reset", data: JSON.stringify(resetEvent) });
        }

        const result = aiStreamText({
          model: resolvedModel.model,
          system: buildSystemPrompt({ cwd, mode }),
          messages: history as never,
          tools,
          stopWhen: tools ? stepCountIs(50) : undefined,
          abortSignal: abortController.signal,
          providerOptions: resolvedModel.providerOptions,
        });

        for await (const part of result.fullStream) {
          resetStallTimeout();
          if (stream.aborted) break;

          if (part.type === "reasoning-delta") {
            const last = parts[parts.length - 1];
            if (last && last.type === "reasoning") {
              last.text += part.text;
            } else {
              parts.push({type: "reasoning", text: part.text});
            }
            const event: ChatStreamEvent = {type: "reasoning-delta", text: part.text};
            await stream.writeSSE({
              event: "reasoning-delta", 
              data: JSON.stringify(event) });
          }

          if (part.type === "text-delta") {
            const last = parts[parts.length - 1];
            if (last && last.type === "text"){
              last.text += part.text;
            } else {
              parts.push({type: "text", text: part.text})
            };

            const event: ChatStreamEvent = { type: "text-delta", text: part.text };
            await stream.writeSSE({
              event: "text-delta",
              data: JSON.stringify(event),
            });
          }

          if (part.type === "tool-call") {
            const args = toolCallArgsSchema.parse(part.input);

            parts.push({
              type: "tool-call",
              id: part.toolCallId,
              name: part.toolName,
              args,
            });

            const event: ChatStreamEvent = {
              type: "tool-call",
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              args,
            };
            await stream.writeSSE({event: "tool-call", data: JSON.stringify(event)});
          }

          if (part.type === "tool-result"){
            const resultStr = 
            typeof part.output === "string" ? part.output : JSON.stringify(part.output);

            const tcPart = parts.find(
              (p): p is Extract<messagePart, {type: "tool-call"}> =>
                p.type === "tool-call" && p.id === part.toolCallId,
            );

            if (tcPart) {
             tcPart.result = resultStr;
            }

            const event: ChatStreamEvent = {
              type: "tool-call-result",
              toolCallId: part.toolCallId,
              result: resultStr,
            };

            await stream.writeSSE({event: "tool-call-result", data: JSON.stringify(event)});
          }

          if (part.type === "error") {
            throw part.error;
          }
        }
        clearTimeout(timeoutHandle);
        if (stream.aborted || abortController.signal.aborted) {
          await persistInterruptedMessage();
          return;
        }

        const elapsedMs = Date.now() - startTime;
        const fullText = parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("");

        const validateParts: Prisma.InputJsonValue | undefined = 
          parts.length > 0 ? messagePartsSchema.parse(parts) : undefined;

        const assistantMessage = await db.message.create({
          data: {
            SessionId: sessionId,
            role: "ASSISTANT",
            status: MessageStatus.COMPLETE,
            model: usedModel,
            content: fullText,
            parts: validateParts,
            mode,
            duration: Math.round(elapsedMs / 1000),
          },
        });

        const doneEvent: ChatStreamEvent = {
          type: "done",
          messageId: assistantMessage.id,
          durationMs: elapsedMs,
          model: usedModel,
        };
        await stream.writeSSE({ event: "done", data: JSON.stringify(doneEvent) });
        return;
      } catch (err) {
        lastError = err;
        if (abortController.signal.aborted) throw err;
        if (isRetryableUpstreamError(err) && candidateModel !== triedModels[triedModels.length - 1]) {
          console.warn(
            `[fallback] ${candidateModel} failed, trying next: ${err instanceof Error ? err.message : String(err)}`,
          );
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  } catch (err) {
    clearTimeout(timeoutHandle);
    if (abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }
    const message = err instanceof Error ? err.message : String(err);

    await db.message.create({
      data: {
        SessionId: sessionId,
        role: "ERROR",
        status: MessageStatus.COMPLETE,
        model: usedModel,
        content: message,
        mode,
      },
    });

    const errorEvent: ChatStreamEvent = { type: "error", message };
    await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) });
  }
}

const app = new Hono<AuthenticatedEnv>()
  .post("/:sessionId/resume", async (c) => {
    const sessionId = c.req.param("sessionId");
    const userId = c.get("userId");

    const session = await db.session.findUnique({
      where: { id: sessionId, UserId: userId},
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const resumableMessage = getResumableUserMessage(session.messages);
    if (!resumableMessage) {
      return c.json(
        { error: "Session has no pending user message to resume" },
        409,
      );
    }

    if (!isSupportedChatModel(resumableMessage.model)) {
      return c.json(
        { error: `Session uses unsupported model: ${resumableMessage.model}` },
        409,
      );
    }

    if (activeSessionIds.has(sessionId)) {
      return c.json({error: "Session already has an active resume"},
        409);
    }

    activeSessionIds.add(sessionId);

    const history = buildConversationHistory(session.messages);
    const abortController = new AbortController();

    try {
    return streamSSE(
      c,
      async (stream) => {
        stream.onAbort(() => {
          abortController.abort();
        });

        try {
        await streamAIResponse(stream, {
          sessionId,
          model: resumableMessage.model,
          cwd: session.cwd,
          history,
          mode: resumableMessage.mode,
          abortController,
          modelPriority: FREE_MODEL_PRIORITY,
        });
        } finally {
          activeSessionIds.delete(sessionId);
        }
      },
      async (err, stream) => {
        activeSessionIds.delete(sessionId);
        const message = err instanceof Error ? err.message : String(err);
        const errorEvent: ChatStreamEvent = { type: "error", message };
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify(errorEvent),
        });
      },
    );
    } catch (error) {
      activeSessionIds.delete(sessionId);
      throw error;
    }
  })
  .post("/:sessionId", submitValidator, async (c) => {
    const sessionId = c.req.param("sessionId");
    const userId = c.get("userId");

    const session = await db.session.findUnique({
      where: { id: sessionId, UserId: userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const data = c.req.valid("json");

    if (activeSessionIds.has(sessionId)) {
      return c.json({ error: "Session already has an active request" }, 409);
    }

    activeSessionIds.add(sessionId);

    try {
      await db.message.create({
        data: {
          SessionId: sessionId,
          role: "USER",
          status: MessageStatus.COMPLETE,
          model: data.model,
          content: data.content,
          mode: data.mode,
        },
      });

      const history = buildConversationHistory([
        ...session.messages,
        {
          role: "USER" as const,
          content: data.content,
          status: MessageStatus.COMPLETE,
        },
      ]);

      const abortController = new AbortController();

      return streamSSE(
        c,
        async (stream) => {
          stream.onAbort(() => {
            abortController.abort();
          });

          try {
            await streamAIResponse(stream, {
              sessionId,
              model: data.model,
              cwd: session.cwd,
              history,
              mode: data.mode,
              abortController,
              modelPriority: FREE_MODEL_PRIORITY,
            });
          } finally {
            activeSessionIds.delete(sessionId);
          }
        },
        async (err, stream) => {
          activeSessionIds.delete(sessionId);
          const message = err instanceof Error ? err.message : String(err);
          const errorEvent: ChatStreamEvent = { type: "error", message };
          await stream.writeSSE({
            event: "error",
            data: JSON.stringify(errorEvent),
          });
        },
      );
    } catch (error) {
      activeSessionIds.delete(sessionId);
      throw error;
    }
  });

export default app;
