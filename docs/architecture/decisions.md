# Architectural Decisions

## Why Vercel AI SDK instead of raw API calls

The `ai` package provides:
- Multi-provider abstraction (OpenAI, Anthropic, and 20+ others)
- Streaming with backpressure and cancellation
- Built-in tool calling support
- Standardized `fullStream` event types

This lets us switch providers by changing a model ID without touching the streaming logic.

## Why SSE instead of WebSockets

SSE is simpler for unidirectional server-to-client streaming:
- Built on standard HTTP — no upgrade handshake
- Works through proxies and load balancers
- Native `ReadableStream` support in Bun
- Hono's `streamSSE` handles formatting and backpressure

WebSockets would be needed for bidirectional streaming (e.g., if the client needs to send data mid-stream without a new request).

## Why Ref + State separation

The `useChat` hook splits concerns:
- **Refs** (`ActiveStreamRef`): Hold mutable runtime handles that don't trigger re-renders (AbortController, accumulating parts)
- **State** (`messages`, `streaming`): Trigger re-renders when changed

This avoids unnecessary re-renders during high-frequency SSE events while keeping the UI reactive.

## Why a shared SSE schema

`chatStreamEventSchema` in `@filiks/shared` ensures:
- The server and client agree on the wire format
- Both sides can validate incoming/outgoing events
- Adding a new event type requires updating one file
- TypeScript types are inferred from the schema, not hand-written

## Why auto-resume

If the user closes the app mid-stream, the last message is a USER with no ASSISTANT reply. Auto-resume on mount:
- Detects this state
- Calls `/resume` to re-stream from the last user message
- No manual "retry" step needed from the user

## Provider Abstraction

`resolveChatModel()` in `packages/server/src/lib/models.ts` dispatches to the correct AI SDK provider based on model ID:

```ts
case "anthropic" → anthropic(modelId)
case "openai"   → openai(modelId)
```

Adding a new provider (e.g., Ollama, Google Gemini) means:
1. Install the provider package
2. Add model entries to `SUPPORTED_CHAT_MODELS` in `@filiks/shared`
3. Add a case to the switch statement
4. Add environment variable documentation
