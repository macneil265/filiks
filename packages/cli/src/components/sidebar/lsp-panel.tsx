import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme";
import { Panel } from "./panel";

export function LSPPanel() {
  const { colors } = useTheme();

  return (
    <Panel title="LSP" defaultOpen={false}>
      <text attributes={TextAttributes.DIM} fg={colors.textMuted}>
        no LSP connections
      </text>
      <text fg={colors.info} attributes={TextAttributes.DIM}>
        Ctrl+Shift+L to configure
      </text>
    </Panel>
  );
}
