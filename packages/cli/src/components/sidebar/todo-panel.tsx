import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme";
import { usePromptConfig } from "../../providers/prompt-config";
import { Panel } from "./panel";
import type { ClientMessagePart } from "../../hooks/use-chat";

type Props = {
  parts: ClientMessagePart[];
  streaming: boolean;
};

export function TodoPanel({ parts, streaming }: Props) {
  const { colors } = useTheme();
  const { mode } = usePromptConfig();
  const toolCalls = parts.filter((p) => p.type === "tool-call");

  if (mode === "PLAN") return null;
  if (!streaming && toolCalls.length === 0) return null;

  return (
    <Panel title="ToDo" defaultOpen={streaming}>
      {toolCalls.length === 0 && streaming && (
        <text attributes={TextAttributes.DIM} fg={colors.textMuted}>
          waiting...
        </text>
      )}
      {toolCalls.map((tc) => (
        <box key={tc.id} flexDirection="row" gap={1}>
          <text fg={tc.status === "done" ? colors.success : colors.info}>
            {tc.status === "done" ? "✓" : "○"}
          </text>
          <text
            fg={tc.status === "done" ? colors.textMuted : colors.text}
          >
            {tc.name}
          </text>
        </box>
      ))}
    </Panel>
  );
}
