import {resolve, relative} from "path";
import { tool } from "ai";
import { z } from "zod";

const MAX_MATCHES = 50;

export function createGrepTool(cwd: string) {
  return tool({
    description: `Search file contents using a regex pattern. Returns matching lines with file paths and line numbers. Skips hidden directories, node_modules, and binary files.`,
    inputSchema: z.object({
      pattern: z.string().describe("Regex pattern to search for"),
      path: z
        .string()
        .describe("Relative directory to search in (defaults to project root)")
        .default("."),
        include: z
          .string()
          .describe("Glob pattern to filter files (e.g. 'x.ts', '*.tsx')")
          .optional(),
    }),
    execute: async ({ pattern, path, include }) => {
      const resolved = resolve(cwd, path);

      if (!resolved.startsWith(cwd)) {
        return {error: "Path is outside the project directory"}
      }

      try {
        const args = [
          "-rn",
          "-I",
          "--color=never",
          "--exclude-dir=node_modules",
          "--exclude-dir=.git",
          "-E",
        ];

        if (include) {
          args.push(`--include=${include}`);
        }

        args.push(pattern, resolved);

        const proc = Bun.spawn(["grep", ...args], {
          stdout: "pipe",
          stderr: "pipe",
          cwd,
        });

        const reader = proc.stdout.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const matches: { file: string; line: number; content: string }[] = [];
        let truncated = false;
        let totalLines = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            totalLines++;
            if (matches.length >= MAX_MATCHES) {
              truncated = true;
              proc.kill();
              break;
            }

            const m = line.match(/^(.+?):(\d+):(.*)$/);
            if (m) {
              matches.push({
                file: relative(cwd, m[1]!),
                line: parseInt(m[2]!, 10),
                content: m[3]!,
              });
            }
          }
          if (truncated) break;
        }

        reader.releaseLock();

        const stderr = await new Response(proc.stderr).text();
        await proc.exited;

        if (proc.exitCode !== 0 && proc.exitCode !== 1) {
          return { error: `grep failed: ${stderr.trim()}` };
        }

        if (matches.length === 0 && !buffer.trim()) {
          return { matches: [], message: "No matches found" };
        }

        return {
          matches,
          ...(truncated ? { truncated: true, totalMatches: totalLines } : {}),
        };

        } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { error: `Failed to execute command: ${message}` };
      }
    },
  });
}
