# useChat Hook

The `useChat` hook is the core state machine for the chat experience.

## Signature

```ts
function useChat(sessionId: string, initialMessages: Message[]): UseChatReturn
```

## Returns

| Property | Type | Description |
|---|---|---|
| `messages` | `Message[]` | All messages (loaded + streaming-in-progress) |
| `streaming` | `StreamingState` | `{ status: "idle" }` or `{ status: "streaming", parts, mode, model }` |
| — | — | (more to be implemented) |

## Types

```ts
type Message =
  | { id: string; role: "user"; content: string; mode: Mode; model: SupportedChatModelId }
  | { id: string; role: "assistant"; content: string; mode: Mode; model: SupportedChatModelId; parts: ClientMessagePart[]; duration?: string }
  | { id: string; role: "error"; content: string }

type ClientMessagePart = { type: "text"; text: string }

type StreamingState =
  | { status: "idle" }
  | { status: "streaming"; parts: ClientMessagePart[]; mode: Mode; model: SupportedChatModelId }

type ActiveStream = {
  requestedId: string
  controller: AbortController
  mode: Mode
  model: SupportedChatModelId
  parts: ClientMessagePart[]
}
```

## State Machine

```
        mount (last msg is USER) ───→ idle
                                         │
                                      submit()
                                         │
                                         ▼
                                      streaming ───→ done event ───→ idle
                                         │
                                      stop() / abort
                                         │
                                         ▼
                                      idle (no message saved)
```

## Design Decisions

- **`ActiveStream` in a ref**: Avoids re-renders on every SSE event. Only `messages` and `streaming` trigger renders.
- **`updateMessages` callback**: Wraps `setMessages` so callers don't need to reference `setMessages` directly — isolated for future middleware/reducer patterns.
- **`ClientMessagePart` vs full message**: During streaming, parts are accumulated in the `ActiveStream` ref. The `Message` type has `parts` only on assistant messages (after finalization).

## SSE Parsing

The hook uses `eventsource-parser` for robust SSE parsing (handles partial lines, multiple events in one chunk, etc.):

```ts
const eventStream = response.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new EventSourceParserStream())
```

Each parsed event is validated against `chatStreamEventSchema` from `@filiks/shared` before being processed.
