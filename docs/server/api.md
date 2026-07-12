# API Reference

Server runs on `http://localhost:3000`. All routes return JSON unless noted.

## Sessions

### `GET /sessions`

List all sessions (summary only).

**Response `200`:**
```json
[
  { "id": "cuid...", "title": "Fix the login bug", "createdAt": "..." },
  { "id": "cuid...", "title": "Refactor auth", "createdAt": "..." }
]
```

### `GET /sessions/:id`

Get session with full message history.

**Response `200`:**
```json
{
  "id": "cuid...",
  "title": "Fix the login bug",
  "cwd": "/home/user/project",
  "createdAt": "...",
  "UpdatedAt": "...",
  "messages": [
    { "id": "...", "role": "USER", "content": "Fix this bug", "model": "claude-opus-4-6", "mode": "BUILD", "status": "COMPLETE", "createdAt": "..." },
    { "id": "...", "role": "ASSISTANT", "content": "Here's the fix...", "model": "claude-opus-4-6", "mode": "BUILD", "status": "COMPLETE", "duration": 15, "createdAt": "..." }
  ]
}
```

**Response `404`:**
```json
{ "error": "Session not found" }
```

### `POST /sessions`

Create a new session with optional initial message.

**Request body:**
```json
{
  "title": "Fix the login bug",
  "cwd": "/home/user/project",
  "initialMessage": {
    "role": "USER",
    "content": "Fix this bug",
    "mode": "BUILD",
    "model": "claude-opus-4-6"
  }
}
```

**Response `201`:** Full session object with messages.

## Chat (SSE)

### `POST /chat/:sessionId`

Send a message and stream the AI response via SSE.

**Request body:**
```json
{
  "content": "Fix this bug",
  "mode": "BUILD",
  "model": "claude-opus-4-6"
}
```

**Response: SSE stream** — see [Streaming docs](../server/streaming.md) for event format.

### `POST /chat/:sessionId/resume`

Resume streaming for the last user message (no new input needed). Useful for auto-resume after interruption.

**Request body:** None.

**Response: SSE stream** — same format as the submit endpoint.

**Response `409`:**
```json
{ "error": "Session has no pending user message to resume" }
```

## Sentry

### `GET /debug-sentry`

Trigger a test error to verify Sentry integration. Always throws.

## Error Handling

All errors follow this shape:

```json
{ "error": "Human-readable error message" }
```

HTTP status codes:
- `400` — Validation error
- `404` — Session not found
- `409` — Conflict (e.g., nothing to resume)
- `500` — Internal server error
