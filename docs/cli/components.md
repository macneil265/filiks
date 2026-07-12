# UI Components

## Screen Layout (SessionShell)

The shell wraps all screen content with a scrollable message area and a fixed bottom bar containing the input field and status display.

```
session-shell
├── scrollbox (messages area, sticky-scroll to bottom)
│   └── messages
│       ├── user-message
│       ├── bot-message
│       └── error-message
└── fixed footer
    ├── input-bar
    └── status row
        ├── spinner (when loading)
        └── tab label
```

## Message Components

### UserMessage

Left-bordered box with user text. Uses the theme's primary color for the border.

### BotMessage

Plain text with a model badge below (e.g., `◉ claude-opus-4-6`).

### ErrorMessage

Left-bordered box with dimmed text. Uses the theme's error color.

## InputBar

Textarea-based input with:
- Enter/Return to submit
- Shift+Enter for newline
- Command menu integration (`/` commands, `/model` to switch model, `/theme` to change theme)
- Disabled state during streaming
- Keyboard layer integration for Ctrl+C handling

## Command Menu

Inline dropdown above the input bar triggered by `/`:
- **Commands**: `/model`, `/theme`, etc.
- Navigation with arrow keys, selection with Enter

## StatusBar

Shows current mode and model:
```
Build › opus-4-6
```

## Theming

11 curated themes defined in `theme.tsx`. Each has a distinct perceptual character — no two look alike:

| Theme | Meaning | Vibe | Type |
|---|---|---|---|
| Nkhalango | "forest" | Teal on dark | Default dark |
| Moto | "fire" | Pink/purple neon | Dark |
| Bunda | "savanna" | Amber on dark | Dark |
| Kuwala | "light/glow" | Synthwave neon | Dark |
| Mphamvu | "strength" | Malawi flag colors | Dark |
| Blantyre | "commercial hub" | Burnt sienna/gold | Dark |
| Zotuwa | "pale/faded" | Pure greyscale | Dark |
| Mdima | "darkness" | OLED black, max contrast | Dark |
| Kale | "ancient" | Retro amber terminal | Dark |
| Kasinja | "cool breeze" | Clean blue/white | Light |
| Pepala | "paper" | Warm sepia/cream | Light |

Themes are provided via React context and available to all components through `useTheme()`.
