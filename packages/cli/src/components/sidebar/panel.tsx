import { useState, type ReactNode } from "react";
import { TextAttributes, RGBA } from "@opentui/core";
import { useTheme } from "../../providers/theme";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function Panel({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  return (
    <box flexDirection="column" width="100%">
      <box
        flexDirection="row"
        alignItems="center"
        gap={1}
        backgroundColor={RGBA.fromInts(255, 255, 255, 12)}
        onMouseDown={() => setOpen((v) => !v)}
      >
        <text>{open ? "▼" : "▶"}</text>
        <text attributes={TextAttributes.BOLD} fg={colors.text}>
          {title}
        </text>
      </box>
      {open && (
        <box flexDirection="column" paddingLeft={2} paddingTop={1} gap={0}>
          {children}
        </box>
      )}
    </box>
  );
}
