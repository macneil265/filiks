# Model Resolution

Models are registered in `@filiks/shared` and resolved at runtime by the server.

## Supported Models

| Model ID | Provider | Input Price | Output Price |
|---|---|---|---|
| `claude-opus-4-6` | anthropic | $3/M | $15/M |
| `claude-haiku-4-5` | anthropic | $1/M | $5/M |
| `claude-sonnet-4-6` | anthropic | $3/M | $15/M |
| `gpt-4.1` | openai | $10/M | $30/M |
| `gpt-4o` | openai | $2.50/M | $10/M |
| `gpt-4o-mini` | openai | $0.15/M | $0.60/M |
| `o3-mini` | openai | $1.10/M | $4.40/M |
| `gpt-3.5-turbo` | openai | $0.50/M | $1.50/M |

## Adding a New Model

Example — add a Google Gemini model:

1. **In `packages/shared/src/models.ts`**, add to `SUPPORTED_CHAT_MODELS`:
   ```ts
   { id: "gemini-2.0-flash", provider: "google", pricing: { inputUsdPerMillionTokens: 0.1, outputUsdPerMillionTokens: 0.4 } },
   ```

2. **Update `SupportedProvider`** type to include `"google"`.

3. **In `packages/server/src/lib/models.ts`**, add a resolver:
   ```ts
   if (provider === "google") return resolveGoogleModel(model.id);
   ```

4. **Add env var** `GOOGLE_API_KEY` to `.env.example`.

## Adding a Local Provider (Ollama)

Ollama models can be added via the OpenAI-compatible endpoint:

1. Change nothing in `@filiks/shared` initially (just add a model ID manually)
2. In the server, add an Ollama case that uses `@ai-sdk/openai` with a custom `baseURL`:
   ```ts
   const ollama = openai({ baseURL: "http://localhost:11434/v1" })
   ```
3. Models like `"llama-3.2-3b"` and `"mistral"` become available if Ollama is running locally.

## Environment Variables

| Variable | Required For |
|---|---|
| `ANTHROPIC_API_KEY` | All claude-* models |
| `OPENAI_API_KEY` | All gpt-* models |
