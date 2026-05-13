import type { ApiKeys } from "@/types"

export async function generateDalleImage(
  prompt: string,
  apiKeys: ApiKeys
): Promise<{ url: string } | null> {
  if (!apiKeys.openaiKey) return null

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKeys.openaiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    })

    if (!response.ok) return null

    const data = (await response.json()) as { data?: Array<{ url?: string }> }
    const imageUrl = data.data?.[0]?.url
    if (!imageUrl) return null

    return { url: imageUrl }
  } catch {
    return null
  }
}
