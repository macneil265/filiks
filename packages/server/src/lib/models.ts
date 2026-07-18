import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { deepseek } from "@ai-sdk/deepseek";
import { mistral } from "@ai-sdk/mistral";
import { openrouter } from "./openrouter";
import { opencodeZen } from "./opencode-zen";
import {
  findSupportedChatModel,
  type SupportedChatModel,
  type SupportedChatModelId,
  type SupportedProvider,
} from "@filiks/shared";
import type { LanguageModel } from "ai";


type ProviderOptions = Record<string, any>;

type AnthropicModelId = Extract<
  SupportedChatModel,
  { provider: "anthropic" }
>["id"];
type OpenAIModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"];
type OpenRouterModelId = Extract<
  SupportedChatModel,
  { provider: "openrouter" }
>["id"];

type GoogleModelId = Extract<SupportedChatModel, { provider: "google" }>["id"];
type GroqModelId = Extract<SupportedChatModel, { provider: "groq" }>["id"];
type DeepSeekModelId = Extract<SupportedChatModel, { provider: "deepseek" }>["id"];
type MistralModelId = Extract<SupportedChatModel, { provider: "mistral" }>["id"];

type OpenCodeZenModelId = Extract<SupportedChatModel, { provider: "opencode-zen" }>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
  providerOptions?: ProviderOptions;
};

const ANTHROPIC_PROVIDER_OPTIONS: Partial<Record<AnthropicModelId, ProviderOptions>> = {
  "claude-opus-4-6": {
    anthropic: {
      thinking: {
        type: "enabled",
        budgetTokens: 10000,
      }
    },
  },
    "claude-sonnet-4-6": {
    anthropic: {
      thinking: {
        type: "enabled",
        budgetTokens: 10000,
      },
    },
    },
    };

const DEEPSEEK_PROVIDER_OPTIONS: Partial<Record<DeepSeekModelId, ProviderOptions>> = {
  "deepseek-reasoner": {
    deepseek: {
      thinking: { type: "enabled" },
    },
  },
};

const OPENAI_PROVIDER_OPTIONS: Partial<Record<OpenAIModelId, ProviderOptions>> = {
  "o3-mini": {
    openai: {
      thinking: { reasoningSummary: "detailed" },
    },
  },
  "gpt-4.1": {
    openai: {
      thinking: { reasoningSummary: "detailed" },
    },
  },
};

const OPENROUTER_PROVIDER_OPTIONS: Partial<Record<OpenRouterModelId, ProviderOptions>> = {
  "tencent/hy3:free": {
    openrouter: {
      reasoning_effort: "high",
    },
  },
};

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Unsupported provider: ${provider}`);
}

function resolveAnthropicModel(modelId: AnthropicModelId): ResolvedModel {
  return {
    model: anthropic(modelId),
    provider: "anthropic",
    modelId,
    providerOptions: ANTHROPIC_PROVIDER_OPTIONS[modelId]
  };
}

function resolveOpenAIModel(modelId: OpenAIModelId): ResolvedModel {
  return {
    model: openai(modelId),
    provider: "openai",
    modelId,
    providerOptions: OPENAI_PROVIDER_OPTIONS[modelId],
  };
}

function resolveOpenRouterModel(modelId: OpenRouterModelId): ResolvedModel {
  return {
    model: openrouter.chat(modelId),
    provider: "openrouter",
    modelId,
    providerOptions: OPENROUTER_PROVIDER_OPTIONS[modelId],
  };
}

function resolveGoogleModel(modelId: GoogleModelId): ResolvedModel {
  return {
    model: google(modelId),
    provider: "google",
    modelId,
  };
}

function resolveGroqModel(modelId: GroqModelId): ResolvedModel {
  return {
    model: groq(modelId),
    provider: "groq",
    modelId,
  };
}

function resolveDeepSeekModel(modelId: DeepSeekModelId): ResolvedModel {
  return {
    model: deepseek(modelId),
    provider: "deepseek",
    modelId,
    providerOptions: DEEPSEEK_PROVIDER_OPTIONS[modelId],
  };
}

function resolveMistralModel(modelId: MistralModelId): ResolvedModel {
  return {
    model: mistral(modelId),
    provider: "mistral",
    modelId,
  };
}

function resolveOpenCodeZenModel(modelId: OpenCodeZenModelId): ResolvedModel {
  return {
    model: opencodeZen.chat(modelId),
    provider: "opencode-zen",
    modelId,
    providerOptions: {},
  };
}

function resolveSupportedChatModel(model: SupportedChatModel): ResolvedModel {
  const provider = model.provider;

  switch (provider) {
    case "anthropic":
      return resolveAnthropicModel(model.id);
    case "openai":
      return resolveOpenAIModel(model.id);
    case "openrouter":
      return resolveOpenRouterModel(model.id);
    case "google":
      return resolveGoogleModel(model.id);
    case "groq":
      return resolveGroqModel(model.id);
    case "deepseek":
      return resolveDeepSeekModel(model.id);
    case "mistral":
      return resolveMistralModel(model.id);
    case "opencode-zen":
      return resolveOpenCodeZenModel(model.id);
    default:
      return assertUnsupportedProvider(provider);
  }
}

export function isSupportedChatModel(
  modelId: string,
): modelId is SupportedChatModelId {
  return findSupportedChatModel(modelId) != null;
}

export function resolveChatModel(modelId: string): ResolvedModel {
  const model = findSupportedChatModel(modelId);
  if (!model) {
    throw new Error(`Unsupported model: ${modelId}`);
  }
  return resolveSupportedChatModel(model);
};
