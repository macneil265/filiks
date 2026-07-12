import { Hono } from "hono";
import {sentry} from "@sentry/hono/bun";
import * as Sentry from "@sentry/hono/bun";
import { HTTPException } from "hono/http-exception";
import { db } from "@filiks/database/client";
import sessions from "./routes/sessions"
import chat from "./routes/chat"

const app = new Hono();

// Warm up the database connection to absorb Neon cold-start delay
db.$queryRaw`SELECT 1`.then(() => {
  Sentry.logger.info("Database connection established");
}).catch((err: unknown) => {
  Sentry.logger.warn("Database warm-up failed", {
    message: err instanceof Error ? err.message : String(err),
  });
});

app.use(
  sentry(app, {
    dsn: "https://b88d287e2de7922fd73b57e0ce0968be@o4511441717559296.ingest.de.sentry.io/4511667015254096",
    tracesSampleRate: 1.0,
    enableLogs: true,
    dataCollection: {
      // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#dataCollection
      // userInfo: false,
      // httpBodies: [],
    },
  }),
);

app.get("/debug-sentry", () => {
  // Send a log before throwing the error
  Sentry.logger.info('User triggered test error', {
    action: 'test_error_endpoint',
  });
  // Send a test metric before throwing the error
  Sentry.metrics.count('test_counter', 1);
  throw new Error("My first Sentry error!");
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    Sentry.logger.warn("handled HTTP error", {
      status: error.status,
      message: error.message || "Request failed",
      path: c.req.method,
      method: c.req.method,
    });
    return c.json({ 
        error: error.message || "Request failed", 
    }, error.status);
  };

  Sentry.logger.error("Unhandled server error", {
    path: c.req.path,
    method: c.req.method,
    message: error instanceof Error ? error.message : "Unknown error",
  });
  return c.json({ error: "Internal server error"}, 500);
});

const routes = app.route("/sessions", sessions).route("/chat", chat);

export type AppType = typeof routes;

// idleTimeout must be high, otherwise LLM tool calls might not complete
export default {port: 3000, fetch: app.fetch, idleTimeout: 255};
