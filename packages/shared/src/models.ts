export type ModelPricing = {
    inputUsdPerMillionTokens: number,
    outputUsdPerMillionTokens: number
};


export type SupportedProvider = "anthropic" | "openai" | "openrouter";

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
] as const satisfies readonly SupportedChatModeDefinition[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS) [number];
export type SupportedChatModelId = SupportedChatModel["id"];

export function findSupportedChatModel(modelId: string) {
    return SUPPORTED_CHAT_MODELS.find((model) => model.id === modelId);
}

export const DEFAULT_CHAT_MODEL_ID: SupportedChatModelId = "nvidia/nemotron-3-super-120b-a12b:free";