import type { ApiKeys } from "@/types"

export interface LLMMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function callLLM(
  messages: LLMMessage[],
  apiKeys: ApiKeys,
  options?: { jsonMode?: boolean; maxTokens?: number }
): Promise<string> {
  if (!apiKeys.openaiKey) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.")
  }

  const baseUrl = (apiKeys.llmBaseUrl?.trim() || "https://api.openai.com/v1").replace(/\/$/, "")
  const model = apiKeys.llmModel ?? "gpt-4o"

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: options?.maxTokens ?? 4096,
  }

  if (options?.jsonMode) {
    body.response_format = { type: "json_object" }
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKeys.openaiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM API 오류 (${response.status}): ${errorText}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices[0]?.message?.content
  if (!content) throw new Error("LLM 응답에 content가 없습니다.")

  return content
}
