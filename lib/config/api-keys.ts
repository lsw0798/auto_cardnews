import type { ApiKeys } from "@/types"

export function loadApiKeysFromEnv(): ApiKeys {
  return {
    openaiKey: process.env.OPENAI_API_KEY ?? "",
    serperKey: process.env.SERPER_API_KEY ?? "",
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY ?? "",
    llmBaseUrl: process.env.LLM_BASE_URL ?? "",
    llmModel: process.env.LLM_MODEL ?? "gpt-4o",
  }
}

export function validateApiKeys(keys: ApiKeys): string | null {
  if (!keys.openaiKey) return "OPENAI_API_KEY가 설정되지 않았습니다."
  if (!keys.serperKey) return "SERPER_API_KEY가 설정되지 않았습니다."
  return null
}
