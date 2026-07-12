# Roadmap

## ✅ What's Built

### Server
- [x] Hono server with Sentry error tracking
- [x] Session CRUD (list, get, create)
- [x] Chat SSE endpoint — POST /chat/:sessionId
- [x] Resume SSE endpoint — POST /chat/:sessionId/resume
- [x] Provider abstraction for Anthropic + OpenAI
- [x] Message persistence (USER, ASSISTANT, ERROR)
- [x] Client disconnect detection and abort

### CLI
- [x] React + OpenTUI terminal UI
- [x] Screen routing (Home, NewSession, Session)
- [x] Input bar with command menu, keyboard layers
- [x] Message rendering (user, bot, error)
- [x] 16 color themes with context provider
- [x] Dialog system, toast notifications
- [x] Hono RPC client for typed API calls

### Shared
- [x] SSE event schemas (text-delta, reasoning-delta, tool-call, done, error)
- [x] Message part schemas (reasoning, text, tool-call)
- [x] Model registry (8 models, 2 providers, pricing)

### Database
- [x] Prisma schema with Session + Message models
- [x] Neon PostgreSQL connection with pg adapter
- [x] Enums: Role, Mode, MessageStatus

## 🔨 In Progress

- [ ] `useChat` hook implementation — SSE reading, state machine, submit/stop
- [ ] `session.tsx` integration — wire hook to UI
- [ ] Streaming bot message rendering (content grows as deltas arrive)

## 📋 Up Next

- [ ] **Interruption flow**: Save ASSISTANT messages as `INTERRUPTED` on abort (currently the server returns early without saving)
- [ ] **Message parts**: Populate the `parts` JSON field with structured content instead of using only the flat `content` string
- [ ] **Tool calling**: Wire up Vercel AI SDK's tool call execution — server executes tools, sends results back to the model
- [ ] **History limits**: The conversation history currently includes all messages — needs truncation (last ~10 turns or token budget)
- [ ] **Conversation history**: Context window management — estimate token counts, trim history to fit model context limits
- [ ] **User identity**: Replace `"mock-user"` with real user identification
- [ ] **Ollama support**: Add free local models via OpenAI-compatible endpoint
- [ ] **Streaming indicators**: Show live cursor/animation while message content is being received
- [ ] **pretty-ms integration**: Display human-readable duration in `done` events
- [ ] **Error recovery**: Better UX when the stream fails mid-way — retry button, partial message handling

## 💡 Future Ideas

- **Additional providers**: Google Gemini, OpenRouter, Hugging Face
- **Plan mode**: Constraint-based planning before execution (different from direct BUILD)
- **File operations**: Read/write files, git operations through tool calls
- **Session search**: Full-text search across sessions and messages
- **Multi-session tabs**: Switch between active sessions
- **Export**: Share chat logs, generate PR descriptions from session context
- **Improved interruption**: Save partial assistant response as INTERRUPTED when user stops mid-stream, so resume can continue from where it left off

## Known Issues

- `abortController.signal` used in a boolean context on line 82 of `chat.ts` — always truthy (an `AbortSignal` object). Should be `.aborted`. Currently causes the handler to return early before saving the assistant message on success.
- No API key validation at startup — missing keys cause runtime errors on first LLM call
- `.env.example` has incomplete variable list (missing `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`)
