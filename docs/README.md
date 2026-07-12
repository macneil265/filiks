# Filiks

Filiks is a terminal-based AI coding assistant. It runs in the CLI, connects to LLM providers (OpenRouter, Anthropic, OpenAI), and helps you build software through a conversational interface.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| CLI UI | React 19 + OpenTUI |
| Server | Hono |
| LLM | Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`) |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Monitoring | Sentry |
| Validation | Zod |
| Monorepo | Bun workspaces |

## Packages

| Package | Path | Purpose |
|---|---|---|
| `@filiks/cli` | `packages/cli/` | Terminal UI — React app with OpenTUI |
| `@filiks/server` | `packages/server/` | Hono HTTP server — REST + SSE endpoints |
| `@filiks/database` | `packages/database/` | Prisma ORM, Postgres adapter, generated client |
| `@filiks/shared` | `packages/shared/` | Shared Zod schemas, model definitions, types |

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env: add DATABASE_URL and API keys

# Start server (port 3000)
bun run dev:server

# Start CLI (in another terminal)
bun run dev:cli
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string (Neon) |
| `API_URL` | No | Server URL (defaults to http://localhost:3000) |
| `OPENROUTER_API_KEY` | For OpenRouter models (default) | OpenRouter API key |
| `ANTHROPIC_API_KEY` | For Claude models | Anthropic API key |
| `OPENAI_API_KEY` | For GPT models | OpenAI API key |
