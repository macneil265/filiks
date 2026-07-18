export type ModelPricing = {
    inputUsdPerMillionTokens: number,
    outputUsdPerMillionTokens: number
};


export type SupportedProvider = "anthropic" | "openai" | "openrouter" | "google" | "groq" | "deepseek" | "mistral" | "opencode-zen";

type SupportedChatModeDefinition = {
    id: string,
    provider: SupportedProvider,
    pricing: ModelPricing
};

export const SUPPORTED_CHAT_MODELS = [
    {   
        id: "claude-opus-4-6",
        provider: "anthropic",
        pricing: {
            inputUsdPerMillionTokens: 3,
            outputUsdPerMillionTokens: 15,
        },
    },
   
    {
        id: "claude-haiku-4-5",
        provider: "anthropic",
        pricing: {
            inputUsdPerMillionTokens: 1,
            outputUsdPerMillionTokens: 5,
        },
    },
     {
        id: "claude-sonnet-4-6",
        provider: "anthropic",
        pricing: {
            inputUsdPerMillionTokens: 3,
            outputUsdPerMillionTokens: 15,
        },
    },
    {
        id: "gpt-4.1",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 10,
            outputUsdPerMillionTokens: 30,
        },
    },
    {
        id: "gpt-4o",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 2.5,
            outputUsdPerMillionTokens: 10,
        },
    },
    {
        id: "gpt-4o-mini",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 0.15,
            outputUsdPerMillionTokens: 0.6,
        },
    },
    {
        id: "o3-mini",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 1.1,
            outputUsdPerMillionTokens: 4.4,
        },
    },
    {
        id: "gpt-3.5-turbo",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 0.5,
            outputUsdPerMillionTokens: 1.5,
        },
    },
    {
        id: "nvidia/nemotron-3-super-120b-a12b:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "deepseek/deepseek-chat",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "meta-llama/llama-3.2-3b-instruct:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "qwen/qwen-2.5-7b-instruct:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "nvidia/nemotron-3-ultra-550b-a55b:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "tencent/hy3:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "cohere/north-mini-code:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "poolside/laguna-xs-2.1:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "google/gemma-4-26b-a4b-it:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "qwen/qwen3-coder:free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "openrouter/free",
        provider: "openrouter",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "gemini-2.5-flash",
        provider: "google",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "gemini-2.5-pro",
        provider: "google",
        pricing: {
            inputUsdPerMillionTokens: 1.25,
            outputUsdPerMillionTokens: 10,
        },
    },
    {
        id: "gemini-2.0-flash-lite",
        provider: "google",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "meta-llama/llama-4-scout-17b-16e-instruct",
        provider: "groq",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "llama-3.3-70b-versatile",
        provider: "groq",
        pricing: {
            inputUsdPerMillionTokens: 0.59,
            outputUsdPerMillionTokens: 0.79,
        },
    },
    {
        id: "deepseek-r1-distill-llama-70b",
        provider: "groq",
        pricing: {
            inputUsdPerMillionTokens: 0.75,
            outputUsdPerMillionTokens: 0.99,
        },
    },
    {
        id: "qwen-qwq-32b",
        provider: "groq",
        pricing: {
            inputUsdPerMillionTokens: 0.29,
            outputUsdPerMillionTokens: 0.39,
        },
    },
    {
        id: "deepseek-chat",
        provider: "deepseek",
        pricing: {
            inputUsdPerMillionTokens: 0.27,
            outputUsdPerMillionTokens: 1.10,
        },
    },
    {
        id: "deepseek-reasoner",
        provider: "deepseek",
        pricing: {
            inputUsdPerMillionTokens: 0.55,
            outputUsdPerMillionTokens: 2.19,
        },
    },
    {
        id: "pixtral-large-latest",
        provider: "mistral",
        pricing: {
            inputUsdPerMillionTokens: 2,
            outputUsdPerMillionTokens: 8,
        },
    },
    {
        id: "mistral-small-latest",
        provider: "mistral",
        pricing: {
            inputUsdPerMillionTokens: 1,
            outputUsdPerMillionTokens: 3,
        },
    },
    {
        id: "ministral-8b",
        provider: "mistral",
        pricing: {
            inputUsdPerMillionTokens: 0.10,
            outputUsdPerMillionTokens: 0.10,
        },
    },
    {
        id: "big-pickle",
        provider: "opencode-zen",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "deepseek-v4-flash-free",
        provider: "opencode-zen",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "mimo-v2.5-free",
        provider: "opencode-zen",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "nemotron-3-ultra-free",
        provider: "opencode-zen",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "north-mini-code-free",
        provider: "opencode-zen",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "hy3-free",
        provider: "opencode-zen",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
] as const satisfies readonly SupportedChatModeDefinition[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS) [number];
export type SupportedChatModelId = SupportedChatModel["id"];

export function findSupportedChatModel(modelId: string) {
    return SUPPORTED_CHAT_MODELS.find((model) => model.id === modelId);
}

export const DEFAULT_CHAT_MODEL_ID: SupportedChatModelId = "deepseek-v4-flash-free";