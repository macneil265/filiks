import { TextAttributes } from "@opentui/core";

export function StatusBar() {
    return (
        <box
            flexDirection="row" gap={1}>
                <text fg="blue">Build</text>
                <text attributes={TextAttributes.DIM} fg="#ffffff">
                    ›
                </text>
                <text>opus-4-6</text>
            </box>
    );
}

