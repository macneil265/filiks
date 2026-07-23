export type ModelPricing = {
  inputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
};

export type SupportedProvider = string;

export interface SupportedChatModel {
  id: string;
  name: string;
  provider: SupportedProvider;
  providerName: string;
  pricing: ModelPricing;
  context: number;
  toolCall: boolean;
  reasoning: boolean;
  env: string[];
  npm: string;
  api?: string;
}

import { providers as snapshotProviders, models as snapshotModels } from "@opencode-ai/models/snapshot";

const ZEN_FREE_MODELS: SupportedChatModel[] = [];

function buildZenModelList(): SupportedChatModel[] {
  if (ZEN_FREE_MODELS.length > 0) return ZEN_FREE_MODELS;

  const provider = snapshotProviders.opencode;
  if (!provider) return [];

  for (const [modelId, model] of Object.entries(provider.models)) {
    const cost = model.cost;
    if (!cost || cost.input !== 0 || cost.output !== 0) continue;
    if (!model.tool_call) continue;

    ZEN_FREE_MODELS.push({
      id: modelId,
      name: model.name,
      provider: "opencode",
      providerName: provider.name,
      pricing: {
        inputUsdPerMillionTokens: 0,
        outputUsdPerMillionTokens: 0,
      },
      context: model.limit.context,
      toolCall: true,
      reasoning: model.reasoning,
      env: provider.env,
      npm: provider.npm,
      api: provider.api,
    });
  }

  return ZEN_FREE_MODELS;
}

const NVIDIA_FREE_MODELS: SupportedChatModel[] = [];

function buildNvidiaModelList(): SupportedChatModel[] {
  if (NVIDIA_FREE_MODELS.length > 0) return NVIDIA_FREE_MODELS;

  const provider = snapshotProviders.nvidia;
  if (!provider) return [];

  for (const [modelId, model] of Object.entries(provider.models)) {
    const cost = model.cost;
    if (!cost || cost.input !== 0 || cost.output !== 0) continue;
    if (!model.tool_call) continue;

    NVIDIA_FREE_MODELS.push({
      id: modelId,
      name: model.name,
      provider: "nvidia",
      providerName: provider.name,
      pricing: {
        inputUsdPerMillionTokens: 0,
        outputUsdPerMillionTokens: 0,
      },
      context: model.limit.context,
      toolCall: true,
      reasoning: model.reasoning,
      env: provider.env,
      npm: provider.npm,
      api: provider.api,
    });
  }

  return NVIDIA_FREE_MODELS;
}

const ZEN_MODELS_INTERNAL = buildZenModelList();
const NVIDIA_MODELS_INTERNAL = buildNvidiaModelList();

const SUPPORTED_CHAT_MODELS_INTERNAL = [...ZEN_MODELS_INTERNAL, ...NVIDIA_MODELS_INTERNAL];

export type SupportedChatModelId = string;

export const SUPPORTED_CHAT_MODELS: readonly SupportedChatModel[] = SUPPORTED_CHAT_MODELS_INTERNAL;

export const ZEN_MODELS: readonly SupportedChatModel[] = ZEN_MODELS_INTERNAL;
export const NVIDIA_MODELS: readonly SupportedChatModel[] = NVIDIA_MODELS_INTERNAL;

export function findSupportedChatModel(modelId: string): SupportedChatModel | undefined {
  return SUPPORTED_CHAT_MODELS_INTERNAL.find((model) => model.id === modelId);
}

export function getSupportedChatModels(): readonly SupportedChatModel[] {
  return SUPPORTED_CHAT_MODELS_INTERNAL;
}

export function getModelsForEnv(availableEnv: string[]): SupportedChatModel[] {
  return SUPPORTED_CHAT_MODELS_INTERNAL.filter((model) =>
    model.env.every((envVar) => availableEnv.includes(envVar)),
  );
}

export const DEFAULT_CHAT_MODEL_ID = "nemotron-3-ultra-free";

const ZEN_CONSOLE_MODEL_IDS = new Set([
  "nemotron-3-ultra-free",
  "deepseek-v4-flash-free",
]);

const NVIDIA_CONSOLE_MODEL_IDS = new Set<string>();

export const ZEN_MODEL_PRIORITY: string[] = [...ZEN_MODELS_INTERNAL]
  .filter((m) => ZEN_CONSOLE_MODEL_IDS.has(m.id))
  .sort((a, b) => b.context - a.context)
  .map((m) => m.id);

export const NVIDIA_MODEL_PRIORITY: string[] = [...NVIDIA_MODELS_INTERNAL]
  .filter((m) => NVIDIA_CONSOLE_MODEL_IDS.has(m.id))
  .sort((a, b) => b.context - a.context)
  .map((m) => m.id);

export const FREE_MODEL_PRIORITY: string[] = [...ZEN_MODEL_PRIORITY, ...NVIDIA_MODEL_PRIORITY];
