# Spec: Tool Calling, Message Parts & System Prompt

## Objective

Enable Filiks to call tools (read files, search code, run commands) during
chat, stream structured message parts (text, reasoning, tool calls) to the
client, and persist them to the database. Add per-mode system prompts.

## Current State

| Feature | Status |
|---------|--------|
| SSE event schemas (tool-call, tool-call-result, reasoning-delta) | Defined |
| `Message.parts` JSON field in Prisma | Exists, unused |
| Server handles `text-delta` / `error` from `fullStream` | Done |
| Server handles `reasoning-delta` / `tool-call` / `tool-call-result` | Ignored |
| Tool definitions passed to `streamText` | None |
| Tool execution on server | None |
| System prompt sent to model | None |
| Parts saved to DB | Not populated |

## Commands

```
Dev: bun run dev:server
Build: bun run --filter=@filiks/server build
```

## Project Structure (additions)

```
packages/server/src/lib/tools/
  index.ts          -- barrel export of all tools
```

`packages/server/src/routes/chat.ts` is the only modified server file.
`packages/cli/src/hooks/use-chat.ts` and `packages/cli/src/providers/prompt-config/`
are the CLI-side modifications.

## Implementation Order

### Step 1A: Stream all event types

**chat.ts** -- Extend the `fullStream` loop in `streamAIResponse` to handle
every part type:

- `reasoning-delta` -- accumulate + write SSE `reasoning-delta`
- `tool-call` -- accumulate into parts array + write SSE `tool-call`
- `tool-call-result` -- accumulate into parts array + write SSE `tool-call-result`

No tool execution yet -- just parse and forward so the UI can see them.

### Step 1B: Persist structured parts

**chat.ts** -- Populate `Message.parts` when saving:

- Build `parts[]` alongside `fullText` as the stream progresses
- Save both `content` (flat text fallback) and `parts` (structured JSON)
- Same for INTERRUPTED and ERROR messages

### Step 2A: Define tools

**`packages/server/src/lib/tools/*.ts`** -- Tool definitions using Vercel AI
SDK's `tool()` helper with `zod` parameter schemas.

Initial tool set TBD.

### Step 2B: Wire tools + system prompt in streamText

**chat.ts**:

```ts
const result = aiStreamText({
  model: resolvedModel.model,
  messages: history,
  system: systemPrompt,
  tools: availableTools,
  abortSignal: abortController.signal,
});
```

### Step 2C: Mode-specific system prompts

**PromptConfig** -- Add a `systemPrompt` field that returns different prompts
per mode (BUILD vs PLAN). Send via API when submitting a chat message.

## Success Criteria

- reasoning-delta appears in SSE stream when models emit thinking traces
- tool-call / tool-call-result events appear in SSE when model requests tools
- Messages persisted to DB have populated `parts` JSON array
- BUILD and PLAN modes send different system prompts
