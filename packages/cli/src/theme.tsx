export type ThemeColors = {
    primary: string;
    planMode: string;
    selection: string;
    thinking: string;
    success: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    dialogSurface: string;
    thinkingBorder: string;
    dimSeparator: string;
    text: string;
    textMuted: string;
    textOnSelection: string;
};

export type Theme = {
    name: string;
    colors: ThemeColors;
};

export const THEMES: Theme[] = [
    {
        // Nkhalango — "forest/jungle" (was NightFox)
        name: "Nkhalango",
        colors: {
            primary: "#56D6C2",
            planMode: "#CF8EF4",
            selection: "#89B4FA",
            thinking: "#CF8EFE",
            success: "#82E0AA",
            error: "#E74C5E",
            info: "#56D6C2",
            background: "#0D0D12",
            surface: "#1A1A24",
            dialogSurface: "#0A0A10",
            thinkingBorder: "#34344A",
            dimSeparator: "#4E4E66",
            text: "#E1E1E1",
            textMuted: "#6B7280",
            textOnSelection: "#000000",
        },
    },
    {
        // Lilongwe — capital city, modern (was Catppuccin)
        name: "Lilongwe",
        colors: {
            primary: "#89B4FA",
            planMode: "#CBA6F7",
            selection: "#F5C2E7",
            thinking: "#CBA6F7",
            success: "#A6E3A1",
            error: "#F38BA8",
            info: "#89B4FA",
            background: "#1E1E2E",
            surface: "#313244",
            dialogSurface: "#181825",
            thinkingBorder: "#45475A",
            dimSeparator: "#585B70",
            text: "#CDD6F4",
            textMuted: "#6C7086",
            textOnSelection: "#000000",
        },
    },
    {
        // Moto — "fire" in Chichewa (was Dracula)
        name: "Moto",
        colors: {
            primary: "#BD93F9",
            planMode: "#FF79C6",
            selection: "#6272A4",
            thinking: "#FF79C6",
            success: "#50FA7B",
            error: "#FF5555",
            info: "#8BE9FD",
            background: "#282A36",
            surface: "#44475A",
            dialogSurface: "#21222C",
            thinkingBorder: "#6272A4",
            dimSeparator: "#6272A4",
            text: "#F8F8F2",
            textMuted: "#6272A4",
            textOnSelection: "#FFFFFF",
        },
    },
    {
        // Zomba — misty plateau, cool and composed (was Nord)
        name: "Zomba",
        colors: {
            primary: "#88C0D0",
            planMode: "#B48EAD",
            selection: "#5E81AC",
            thinking: "#81A1C1",
            success: "#A3BE8C",
            error: "#BF616A",
            info: "#88C0D0",
            background: "#2E3440",
            surface: "#3B4252",
            dialogSurface: "#242933",
            thinkingBorder: "#4C566A",
            dimSeparator: "#616E88",
            text: "#ECEFF4",
            textMuted: "#616E88",
            textOnSelection: "#FFFFFF",
        },
    },
    {
        // Tchowa — "twilight/dusk" in Chichewa (was Tokyo Night)
        name: "Tchowa",
        colors: {
            primary: "#7AA2F7",
            planMode: "#BB9AF7",
            selection: "#2AC3DE",
            thinking: "#BB9AF7",
            success: "#9ECE6A",
            error: "#F7768E",
            info: "#7DCFFF",
            background: "#1A1B26",
            surface: "#24283B",
            dialogSurface: "#13141E",
            thinkingBorder: "#565F89",
            dimSeparator: "#565F89",
            text: "#A9B1D6",
            textMuted: "#565F89",
            textOnSelection: "#000000",
        },
    },
    {
        // Mulanje — great mountain, earthy and warm (was Gruvbox)
        name: "Mulanje",
        colors: {
            primary: "#83A598",
            planMode: "#D3869B",
            selection: "#FABD2F",
            thinking: "#D3869B",
            success: "#B8BB26",
            error: "#FB4934",
            info: "#83A598",
            background: "#282828",
            surface: "#3C3836",
            dialogSurface: "#1D2021",
            thinkingBorder: "#504945",
            dimSeparator: "#665C54",
            text: "#EBDBB2",
            textMuted: "#928374",
            textOnSelection: "#000000",
        },
    },
    {
        // Shire — the great river, fluid and warm (was Ayu Dark)
        name: "Shire",
        colors: {
            primary: "#73D0FF",
            planMode: "#D4BFFF",
            selection: "#FFB454",
            thinking: "#FF8F40",
            success: "#7FD962",
            error: "#F26D78",
            info: "#73D0FF",
            background: "#0F1419",
            surface: "#1A1F29",
            dialogSurface: "#0B0E14",
            thinkingBorder: "#3E4B59",
            dimSeparator: "#5C6773",
            text: "#B3B1AD",
            textMuted: "#5C6773",
            textOnSelection: "#000000",
        },
    },
    {
        // Nyanja — "lake/water" in Chichewa, deep and dark (was One Dark)
        name: "Nyanja",
        colors: {
            primary: "#61AFEF",
            planMode: "#C678DD",
            selection: "#E5C07B",
            thinking: "#C678DD",
            success: "#98C379",
            error: "#E06C75",
            info: "#56B6C2",
            background: "#282C34",
            surface: "#3B4048",
            dialogSurface: "#21252B",
            thinkingBorder: "#4B5263",
            dimSeparator: "#5C6370",
            text: "#ABB2BF",
            textMuted: "#5C6370",
            textOnSelection: "#000000",
        },
    },
    {
        // Nyasa — old name for Lake Malawi · rich teal and cyan waters
        name: "Nyasa",
        colors: {
            primary: "#22D3EE",
            planMode: "#818CF8",
            selection: "#0891B2",
            thinking: "#818CF8",
            success: "#34D399",
            error: "#FB7185",
            info: "#38BDF8",
            background: "#001F2D",
            surface: "#002A3D",
            dialogSurface: "#001018",
            thinkingBorder: "#0E4C6A",
            dimSeparator: "#1A6A8A",
            text: "#94A3B8",
            textMuted: "#475569",
            textOnSelection: "#FFFFFF",
        },
    },
    {
        // Bunda — open savanna grassland · earthy amber, warm browns, dry heat
        name: "Bunda",
        colors: {
            primary: "#FBBF24",
            planMode: "#F97316",
            selection: "#D97706",
            thinking: "#F97316",
            success: "#86EFAC",
            error: "#F87171",
            info: "#FBBF24",
            background: "#1C1410",
            surface: "#261C14",
            dialogSurface: "#110C08",
            thinkingBorder: "#44300A",
            dimSeparator: "#6B4A14",
            text: "#D6D3D1",
            textMuted: "#78716C",
            textOnSelection: "#FFFFFF",
        },
    },
    {
        // Kasinja — "cool breeze" · clean light mode, airy and minimal
        name: "Kasinja",
        colors: {
            primary: "#2563EB",
            planMode: "#7C3AED",
            selection: "#BFDBFE",
            thinking: "#7C3AED",
            success: "#059669",
            error: "#DC2626",
            info: "#0284C7",
            background: "#F8FAFC",
            surface: "#E2E8F0",
            dialogSurface: "#F1F5F9",
            thinkingBorder: "#CBD5E1",
            dimSeparator: "#94A3B8",
            text: "#0F172A",
            textMuted: "#64748B",
            textOnSelection: "#1E293B",
        },
    },
    {
        // Blantyre — commercial hub, warm & energetic · burnt sienna and gold
        name: "Blantyre",
        colors: {
            primary: "#FB923C",
            planMode: "#FBBF24",
            selection: "#EA580C",
            thinking: "#FBBF24",
            success: "#4ADE80",
            error: "#F43F5E",
            info: "#FB923C",
            background: "#160C04",
            surface: "#221508",
            dialogSurface: "#0D0602",
            thinkingBorder: "#4A2008",
            dimSeparator: "#703010",
            text: "#D6D3D1",
            textMuted: "#78716C",
            textOnSelection: "#FFFFFF",
        },
    },
    {
        // Mphamvu — "strength/power" · Malawi flag inspired · black, red, green
        name: "Mphamvu",
        colors: {
            primary: "#339E66",
            planMode: "#CE1126",
            selection: "#FFD700",
            thinking: "#CE1126",
            success: "#339E66",
            error: "#CE1126",
            info: "#339E66",
            background: "#0A0A0A",
            surface: "#1A1A1A",
            dialogSurface: "#050505",
            thinkingBorder: "#CE1126",
            dimSeparator: "#333333",
            text: "#F0F0F0",
            textMuted: "#888888",
            textOnSelection: "#000000",
        },
    },
    {
        // Thyolo — tea-growing highlands · earthy tea-brown and forest greens
        name: "Thyolo",
        colors: {
            primary: "#5B8C5A",
            planMode: "#8B6F47",
            selection: "#A68B5B",
            thinking: "#8B6F47",
            success: "#5B8C5A",
            error: "#994D44",
            info: "#6A8D73",
            background: "#1B241C",
            surface: "#243026",
            dialogSurface: "#121A14",
            thinkingBorder: "#3A4D3B",
            dimSeparator: "#4D664E",
            text: "#D4C9B8",
            textMuted: "#8A9B7E",
            textOnSelection: "#000000",
        },
    },
    {
        // Kuwala — "light/glow" · synthwave neon · deep purple, pink, cyan
        name: "Kuwala",
        colors: {
            primary: "#FF2D95",
            planMode: "#00E5FF",
            selection: "#00E5FF",
            thinking: "#FF2D95",
            success: "#39FF14",
            error: "#FF0055",
            info: "#00E5FF",
            background: "#1A0A2E",
            surface: "#2D1B4E",
            dialogSurface: "#10051E",
            thinkingBorder: "#4A2D7A",
            dimSeparator: "#6B4D9E",
            text: "#F0E6FF",
            textMuted: "#9B7EC8",
            textOnSelection: "#000000",
        },
    },
    {
        // Chilengedwe — "nature" · soft green, warm beige · easy on the eyes
        name: "Chilengedwe",
        colors: {
            primary: "#A7C080",
            planMode: "#E67E80",
            selection: "#D3C6AA",
            thinking: "#E67E80",
            success: "#A7C080",
            error: "#E67E80",
            info: "#7FBBB3",
            background: "#2B3E36",
            surface: "#354A40",
            dialogSurface: "#1E2E28",
            thinkingBorder: "#4B665A",
            dimSeparator: "#6B8375",
            text: "#D3C6AA",
            textMuted: "#859B7A",
            textOnSelection: "#000000",
        },
    },
    {
        // Pepala — "paper" · warm sepia light mode, creamy and gentle
        name: "Pepala",
        colors: {
            primary: "#8B5CF6",
            planMode: "#A78BFA",
            selection: "#FDE68A",
            thinking: "#A78BFA",
            success: "#059669",
            error: "#DC2626",
            info: "#0284C7",
            background: "#FFF8F0",
            surface: "#F5EDE0",
            dialogSurface: "#FAF4EA",
            thinkingBorder: "#E8DDD0",
            dimSeparator: "#A89888",
            text: "#3D2E1E",
            textMuted: "#8B7D6B",
            textOnSelection: "#1C140E",
        },
    },
    {
        // Zotuwa — "pale/faded" · pure monochrome grayscale · minimal focus
        name: "Zotuwa",
        colors: {
            primary: "#E0E0E0",
            planMode: "#BBBBBB",
            selection: "#555555",
            thinking: "#BBBBBB",
            success: "#CCCCCC",
            error: "#999999",
            info: "#AAAAAA",
            background: "#0F0F0F",
            surface: "#1F1F1F",
            dialogSurface: "#080808",
            thinkingBorder: "#3A3A3A",
            dimSeparator: "#555555",
            text: "#F0F0F0",
            textMuted: "#777777",
            textOnSelection: "#FFFFFF",
        },
    },
];

export const DEFAULT_THEME = THEMES.find((t) => t.name === "Nkhalango")!;