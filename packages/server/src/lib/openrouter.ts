import dotenv from "dotenv";
import path from "path";
import { createOpenAI } from "@ai-sdk/openai";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../../.env"),
});

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY,
});
