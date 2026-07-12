# SSE Streaming

The chat endpoints use Server-Sent Events (SSE) to stream AI responses in real time.

## Wire Format

Events follow the standard SSE format:

```
event: text-delta
data: {"type":"text-delta","text":"Hello"}

event: text-delta
data: {"type":"text-delta","text":" world"}

event: done
data: {"type":"done","messageId":"abc123","durationMs":5432}
```

## Event Types

Events are validated against `chatStreamEventSchema` from `@filiks/shared`.

### `text-delta`

A chunk of text in the assistant's response.

```json
{ "type": "text-delta", "text": "partial text" }
```

The client concatenates these to build the full response.

### `reasoning-delta`

A chunk of reasoning text (used by models like Claude for chain-of-thought).

```json
{ "type": "reasoning-delta", "text": "Let me think about this..." }
```

### `tool-call`

The model is requesting to call a tool.

```json
{
  "type": "tool-call",
  "toolCallId": "call_123",
  "toolName": "read_file",
  "args": { "path": "/src/main.ts" }
}
```

### `tool-call-result`

Result of a tool call back to the model.

```json
{
  "type": "tool-call-result",
  "toolCallId": "call_123",
  "result": "file contents..."
}
```

### `done`

The stream completed successfully. Always the final event on success.

```json
{ "type": "done", "messageId": "cuid...", "durationMs": 5432 }
```

The `messageId` is the ID of the saved ASSISTANT message in the database.

### `error`

An error occurred. The stream closes after this event.

```json
{ "type": "error", "message": "Anthropic API error: rate limit exceeded" }
```

## Streaming Lifecycle

```
Client → POST /chat/:sessionId
  Server: saves USER message, loads history, calls LLM
  ├── 0+ text-delta events
  ├── 0+ reasoning-delta events
  ├── 0+ tool-call / tool-call-result pairs
  ├── done event (success) — stream closes
  └── error event (failure) — stream closes

On client disconnect:
  Server detects stream.aborted, breaks out of loop
  ASSISTANT message is NOT saved to DB
  Next mount will see USER without ASSISTANT → auto-resume
```

## Implementation Notes

- Events are written using Hono's `streamSSE` which handles formatting and flushing
- The abort controller is wired to `stream.onAbort()` for clean cancellation
- On error, the ERROR message is saved to DB before writing the SSE error event
- Duration is tracked from stream start to `done`, saved in milliseconds
