import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamText as aiStreamText, stepCountIs } from "ai";
import { db } from "@filiks/database/client";
import { Mode, MessageStatus } from "@filiks/database/enums";
import type {Prisma} from "@filiks/database";
import { 
   type ChatStreamEvent,
   type messagePart,
   toolCallArgsSchema,
   messagePartsSchema,


 } from "@filiks/shared";
 import {createTools} from "../tools";
 import { buildSystemPrompt } from "../system-prompt";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";


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

function buildConversationHistory(
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    content: string;
    status: MessageStatus;
    parts?: Prisma.JsonValue | null;
  }[],
) {
  const result: HistoryMessage[] = [];

  for (const m of messages) {
    if (m.role === "ERROR") continue;

    if (m.role === "USER") {
      result.push({ role: "user", content: m.content });
      continue;
    }

    if (m.content.length === 0 && (!m.parts || !Array.isArray(m.parts) || m.parts.length === 0)) {
      continue;
    }

    const parts = m.parts ? messagePartsSchema.parse(m.parts) : [];
    const toolCalls = parts.filter(
      (p): p is Extract<messagePart, { type: "tool-call" }> => p.type === "tool-call",
    );
    const textParts = parts.filter(
      (p): p is Extract<messagePart, { type: "text" }> => p.type === "text",
    );

    if (toolCalls.length === 0) {
      result.push({ role: "assistant", content: m.content });
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
        args: tc.args,
      });
    }

    result.push({ role: "assistant", content: assistantContent });

    for (const tc of toolCalls) {
      if (tc.result != null) {
        result.push({
          role: "tool",
          content: [{
            type: "tool-result",
            toolCallId: tc.id,
            toolName: tc.name,
            args: tc.args,
            result: tc.result,
          }],
        });
      }
    }
  }

  return result;
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
};

async function streamAIResponse(
  stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
  params: StreamParams,
) {
  const { sessionId, model, cwd, history, mode, abortController } = params;
  const startTime = Date.now();
  const tools = cwd ? createTools(cwd, mode) : undefined;
  const parts: messagePart[] = [];
  const resolvedModel = resolveChatModel(model);
  

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
        model,
        content: fullText,
        parts: validatedParts,
        mode,
        duration: Math.round(elapsedMs / 1000),
      },
    });
  };

   try {
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
        model,
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
    };

    await stream.writeSSE({ event: "done", data: JSON.stringify(doneEvent) });
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
        model,
        content: message,
        mode,
      },
    });

    const errorEvent: ChatStreamEvent = { type: "error", message };
    await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) });
  }
}

const app = new Hono()
  .post("/:sessionId/resume", async (c) => {
    const sessionId = c.req.param("sessionId");

    const session = await db.session.findUnique({
      where: { id: sessionId },
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

    const session = await db.session.findUnique({
      where: { id: sessionId },
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
