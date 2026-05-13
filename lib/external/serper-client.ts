import type { SearchResult } from "@/types"

interface SerperOrganicResult {
  title?: string
  link?: string
  snippet?: string
}

interface SerperNewsResult {
  title?: string
  link?: string
  snippet?: string
}

export async function searchWeb(
  keyword: string,
  serperKey: string,
  type: "search" | "news"
): Promise<SearchResult[]> {
  if (!serperKey) throw new Error("Serper API 키가 설정되지 않았습니다.")

  const endpoint =
    type === "news"
      ? "https://google.serper.dev/news"
      : "https://google.serper.dev/search"

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": serperKey,
    },
    body: JSON.stringify({ q: keyword, num: 20, gl: "kr", hl: "ko" }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Serper API 오류 (${response.status}): ${errorText}`)
  }

  if (type === "news") {
    const data = (await response.json()) as { news?: SerperNewsResult[] }
    return (data.news ?? []).map((item) => ({
      title: item.title ?? "",
      url: item.link ?? "",
      snippet: item.snippet ?? "",
      source: "news" as const,
    }))
  }

  const data = (await response.json()) as { organic?: SerperOrganicResult[] }
  return (data.organic ?? []).map((item) => ({
    title: item.title ?? "",
    url: item.link ?? "",
    snippet: item.snippet ?? "",
    source: "web" as const,
  }))
}
