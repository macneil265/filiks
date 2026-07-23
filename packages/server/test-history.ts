import { modelMessageSchema } from "ai";
import { z } from "zod";

function formatToolOutput(result: unknown): { type: string; value: unknown } {
  if (typeof result === "string") return { type: "text", value: result };
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    return { type: "json", value: result };
  }
  return { type: "text", value: JSON.stringify(result) };
}

// Test each message format that buildConversationHistory now produces
const individualTests: Array<{name: string, msg: unknown}> = [
  {
    name: "user string content",
    msg: { role: "user", content: "Hello" },
  },
  {
    name: "assistant string content",
    msg: { role: "assistant", content: "Hello" },
  },
  {
    name: "assistant text+tool-call (input not args)",
    msg: {
      role: "assistant",
      content: [
        { type: "text", text: "Reading..." },
        { type: "tool-call", toolCallId: "c1", toolName: "readFile", input: { path: "x" } },
      ],
    },
  },
  {
    name: "assistant tool-call only (no text, input not args)",
    msg: {
      role: "assistant",
      content: [
        { type: "tool-call", toolCallId: "c1", toolName: "readFile", input: { path: "x" } },
      ],
    },
  },
  {
    name: "tool-result with object output",
    msg: {
      role: "tool",
      content: [{
        type: "tool-result", toolCallId: "c1", toolName: "readFile",
        input: { path: "x" }, output: formatToolOutput({ content: "text" }),
      }],
    },
  },
  {
    name: "tool-result with null in input (DB round-trip)",
    msg: {
      role: "tool",
      content: [{
        type: "tool-result", toolCallId: "c1", toolName: "readFile",
        input: { path: "x", opt: null }, output: formatToolOutput({ content: "text" }),
      }],
    },
  },
  {
    name: "tool-result with string output",
    msg: {
      role: "tool",
      content: [{
        type: "tool-result", toolCallId: "c1", toolName: "readFile",
        input: { path: "x" }, output: formatToolOutput("Error: file not found"),
      }],
    },
  },
  {
    name: "tool-result with empty output",
    msg: {
      role: "tool",
      content: [{
        type: "tool-result", toolCallId: "c1", toolName: "readFile",
        input: { path: "x" }, output: formatToolOutput(""),
      }],
    },
  },
];

console.log("=== Individual message validation ===");
for (const {name, msg} of individualTests) {
  const r = modelMessageSchema.safeParse(msg);
  console.log(`  ${r.success ? "PASS" : "FAIL"} | ${name}`);
  if (!r.success) {
    console.log(`    Issues:`, JSON.stringify(r.error.issues, null, 2));
  }
}

// Build a 5-turn history like the user's failing case
console.log("\n=== Multi-turn history (5 turns) ===");
const history: unknown[] = [];

// Turn 1
history.push({ role: "user", content: "What files are in the current directory?" });
history.push({
  role: "assistant",
  content: [
    { type: "text", text: "Let me check." },
    { type: "tool-call", toolCallId: "t1c1", toolName: "listDirectory", input: { path: "." } },
  ],
});
history.push({
  role: "tool",
  content: [{ type: "tool-result", toolCallId: "t1c1", toolName: "listDirectory", input: { path: "." }, output: formatToolOutput({ files: ["a.ts", "b.ts"] }) }],
});

// Turn 2
history.push({ role: "user", content: "Read package.json" });
history.push({
  role: "assistant",
  content: [
    { type: "text", text: "Reading..." },
    { type: "tool-call", toolCallId: "t2c1", toolName: "readFile", input: { path: "package.json" } },
  ],
});
history.push({
  role: "tool",
  content: [{ type: "tool-result", toolCallId: "t2c1", toolName: "readFile", input: { path: "package.json" }, output: formatToolOutput({ content: "{...}" }) }],
});

// Turn 3
history.push({ role: "user", content: "Search for zod" });
history.push({
  role: "assistant",
  content: [
    { type: "tool-call", toolCallId: "t3c1", toolName: "grep", input: { pattern: "zod" } },
  ],
});
history.push({
  role: "tool",
  content: [{ type: "tool-result", toolCallId: "t3c1", toolName: "grep", input: { pattern: "zod" }, output: formatToolOutput({ matches: ["import"] }) }],
});

// Turn 4
history.push({ role: "user", content: "Write a summary" });
history.push({ role: "assistant", content: "Filiks is a coding assistant..." });

// Turn 5
history.push({ role: "user", content: "Can we move to clerk auth?" });

// Test the full history
const messagesSchema = z.array(modelMessageSchema);
const fullResult = messagesSchema.safeParse(history);
console.log(`  Full array (${history.length} msgs): ${fullResult.success ? "PASS" : "FAIL"}`);

if (!fullResult.success) {
  // Binary search for the exact failing point
  for (let i = 0; i < history.length; i++) {
    const subset = history.slice(0, i + 1);
    const r = modelMessageSchema.safeParse(subset);
    if (!r.success) {
      console.log(`  FAILS at index ${i}: ${JSON.stringify((history[i] as any).role)} ${(history[i] as any).content?.slice?.(0,50) || JSON.stringify((history[i] as any).content)?.slice(0,50)}`);
      console.log(`  Issues:`, JSON.stringify(r.error.issues, null, 2));
      break;
    }
  }
}
