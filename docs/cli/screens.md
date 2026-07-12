# Screens & Routing

The CLI uses `react-router` with a `createMemoryRouter`. There are three screens:

```
/                → Home
/sessions/new    → NewSession
/sessions/:id    → Session
```

## Home (`/`)

Landing page with the Filiks header and input bar. User types a message here to start a new session.

## NewSession (`/sessions/new`)

Transition screen — navigated to from Home when creating a new session. Receives the message text via route state, sends it as an `initialMessage` to `POST /sessions`, then navigates to the session screen.

This screen does not use `useChat` — the hook kicks in after navigation.

## Session (`/sessions/:id`)

The core screen. Shows the full message history and an input bar for follow-up messages. Uses `useChat` for streaming and state management.

```
┌─────────────────────────────────┐
│  [messages]                     │
│  ┃ User message text            │
│  ┃                              │
│                                 │
│  ◉ claude-opus-4-6              │
│  Bot response text here...      │
│                                 │
│  ┃ Next user message            │
│  ┃                              │
│                                 │
│  [spinner if loading]           │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ Ask anything...      Build› │  │
│ │                    opus-4-6 │  │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

### State Transitions

- **Loading**: Session data is being fetched from the server
- **Streaming**: AI response is being received via SSE
- **Idle**: Waiting for user input
- **Error**: Last request failed (error message shown in message list)

### Auto-Resume

If the session's last message is a USER with no ASSISTANT reply (e.g., interrupted mid-stream), the hook automatically calls `POST /chat/:sessionId/resume` on mount to restart streaming.
