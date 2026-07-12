# Architecture Overview

## Monorepo Structure

The project uses Bun workspaces with four packages under `packages/*`:

```text
filiks/
├── packages/
│   ├── server/       # @filiks/server — HTTP server
│   ├── cli/          # @filiks/cli — Terminal UI
│   ├── database/     # @filiks/database — Prisma ORM
│   └── shared/       # @filiks/shared — Types & schemas
├── .env              # Environment variables (root)
└── bun.lock          # Lockfile
```

## Dependency Graph

```text
@filiks/cli
  ├── @filiks/server      (types only — AppType for Hono RPC)
  ├── @filiks/database    (types only — enums)
  └── @filiks/shared      (schemas, model definitions)

@filiks/server
  ├── @filiks/database    (runtime — db queries)
  └── @filiks/shared      (runtime — model validation)

@filiks/database
  └── @filiks/shared       (no dependency — standalone)

@filiks/shared
  └── zod                  (only dependency)
```

## Data Flow (Chat)

```text
User types message
    │
    ▼
CLI (React + OpenTUI)
    │  POST /chat/:sessionId (SSE)
    ▼
Server (Hono)
    │  Save USER message → DB
    │  Load session history
    │  Call LLM provider
    ▼
Vercel AI SDK
    │  streamText() → fullStream
    ▼
Server
    │  SSE events: text-delta, done, error
    ▼
CLI
    │  eventsource-parser → React state
    ▼
UI re-renders with streaming content
```

## Key Architectural Decisions

- **Ref-for-imperative, state-for-declarative**: `AbortController` and stream handles live in refs; React state drives rendering
- **Provider abstraction via dispatch**: `getModel()` function selects the right AI SDK provider based on model ID — adding a new provider means adding one case
- **SSE schema shared**: `chatStreamEventSchema` in `@filiks/shared` is the single source of truth for the wire format between server and CLI
- **Auto-resume as first-class concept**: If the last message is USER with no ASSISTANT reply, the hook automatically calls `/resume` on mount
