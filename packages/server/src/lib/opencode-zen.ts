import dotenv from "dotenv";
import path from "path";
import { createCustomOpenAIModel } from "./custom-openai";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../../.env"),
});

const apiKey = process.env.OPENCODE_ZEN_API_KEY ?? "";

export const opencodeZen = {
  chat: (modelId: string) =>
    createCustomOpenAIModel(modelId, {
      baseURL: "https://opencode.ai/zen/v1",
      apiKey,
      name: "opencode-zen",
    }),
};
