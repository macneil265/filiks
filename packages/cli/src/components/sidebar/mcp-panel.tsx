import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme";
import { Panel } from "./panel";

export function MCPPanel() {
  const { colors } = useTheme();

  return (
    <Panel title="MCP">
      <text attributes={TextAttributes.DIM} fg={colors.textMuted}>
        no MCP connections
      </text>
      <text fg={colors.info} attributes={TextAttributes.DIM}>
        Ctrl+M to connect
      </text>
    </Panel>
  );
}
