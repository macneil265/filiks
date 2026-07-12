# Shared Schemas

The `@filiks/shared` package contains types and validation schemas used by both the server and CLI. This is the single source of truth for the wire format and model definitions.

## Chat Stream Events

Defined in `schemas.ts`. Used by the server (to validate before writing to SSE) and the CLI (to validate after parsing from SSE).

```ts
chatStreamEventSchema = discriminatedUnion("type", [
  "text-delta"       → { type, text: string }
  "reasoning-delta"  → { type, text: string }
  "tool-call"        → { type, toolCallId, toolName, args }
  "tool-call-result" → { type, toolCallId, result }
  "done"             → { type, messageId, durationMs }
  "error"            → { type, message }
])
```

## Message Parts

Structured content within a single message:

```ts
messagePartSchema = discriminatedUnion("type", [
  "reasoning" → { type, text }
  "tool-call" → { type, id, name, args, result? }
  "text"      → { type, text }
])
```

## Model Definitions

Defined in `models.ts`. Single registry of supported models:

```ts
SUPPORTED_CHAT_MODELS: readonly {
  id: string
  provider: "anthropic" | "openai" | "openrouter"
  pricing: { inputUsdPerMillionTokens, outputUsdPerMillionTokens }
}[]
```

Exported types:
- `SupportedChatModel` — union of all model objects
- `SupportedChatModelId` — union of model ID strings
- `SupportedProvider` — `"anthropic" | "openai" | "openrouter"`

Utilities:
- `findSupportedChatModel(modelId)` — lookup by ID, returns object or undefined
- `DEFAULT_CHAT_MODEL_ID` — `"nvidia/nemotron-3-super-120b-a12b:free"`
