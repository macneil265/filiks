# Data Flow

## Session Creation

```
NewSession screen
    │  POST /sessions  { title, cwd, initialMessage }
    ▼
Server
    │  db.session.create({ UserId, title, messages: { create: initialMessage } })
    ▼
Returns session with messages → navigate to /sessions/:id
    │
    ▼
Session screen uses useChat(sessionId, initialMessages)
    │  Detects last message is USER → auto-resume
    ▼
POST /chat/:sessionId/resume → SSE stream
```

## Message Submission

```
InputBar → onSubmit(text)
    │
    ▼
useChat.submit({ userText, mode, model })
    │  POST /chat/:sessionId  { content, mode, model }
    ▼
Server
    │  Save USER message to DB
    │  Build conversation history
    │  Call LLM → streamSSE
    ▼
CLI reads SSE events
    ├─ text-delta → accumulate parts
    ├─ done       → finalize message, set idle
    └─ error      → save ERROR message, set idle
```

## Interruption

```
User presses stop/escape
    │
    ▼
useChat.stop()
    │  AbortController.abort()
    ▼
Server detects stream.aborted
    │  Loop breaks, returns early
    │  (does not save ASSISTANT message)
    ▼
Client sees stream close without "done"
    │  Marks state as idle
```

## Error Flow

```
LLM call fails
    │
    ▼
Server catch block
    │  Save ERROR message to DB
    │  Write SSE error event
    ▼
Client parses error event
    │  Adds error message to messages list
    │  Sets streaming to idle
```
