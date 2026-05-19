import type { AgentLogEntry, CurateOutput, SearchOutput, StepResult } from "@/types"
import { callLLM } from "@/lib/external/llm-client"
import type { Agent } from "./types"

function log(level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return { timestamp: new Date().toISOString(), level, message }
}

function containsKorean(text: string): boolean {
  return /[가-힣]/.test(text)
}

function makeKoreanFallbacks(keyword: string, count: number): string[] {
  const templates = [
    `${keyword}은(는) 최근 들어 많은 관심을 받고 있는 주제입니다.`,
    `${keyword}에 관한 다양한 정보와 연구 결과가 발표되고 있습니다.`,
    `${keyword} 관련 동향을 꾸준히 파악하는 것이 중요합니다.`,
    `${keyword}의 최신 현황과 변화를 주목해 보세요.`,
    `${keyword}에 대한 사회적 관심이 점점 높아지고 있습니다.`,
    `${keyword} 관련 내용을 꼼꼼히 살펴보시기 바랍니다.`,
  ]
  return templates.slice(0, count)
}

function cleanSnippet(text: string): string {
  // 끝부분의 말줄임표 패턴 제거 (`. ...`, `。...`, `...`, `…` 순서로)
  let cleaned = text.replace(/[。.]\s*\.{3}$/, "").replace(/\.{3}$/, "").replace(/…$/, "").trimEnd()
  // trailing 공백·쉼표·세미콜론 정리 (마침표·느낌표·물음표는 유지)
  cleaned = cleaned.replace(/[,;:\s]+$/, "")
  return cleaned
}

function mockCurate(input: SearchOutput): CurateOutput {
  const results = input.results.slice(0, 8)

  const koreanFacts = results
    .filter((r) => r.snippet && r.snippet.length > 20 && containsKorean(r.snippet))
    .map((r) => cleanSnippet(r.snippet.trim()))

  // 유사 문장 중복 제거 (앞 20자 기준)
  const seen = new Set<string>()
  const dedupedFacts = koreanFacts.filter((f) => {
    const key = f.slice(0, 20)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 8)

  const facts =
    dedupedFacts.length >= 4
      ? dedupedFacts
      : [...dedupedFacts, ...makeKoreanFallbacks(input.keyword, Math.max(0, 6 - dedupedFacts.length))]

  const sources = results.map((r) => r.url).filter(Boolean)

  const firstKoreanSnippet =
    cleanSnippet(results.find((r) => r.snippet && containsKorean(r.snippet))?.snippet?.slice(0, 80) ?? "")
  const summary =
    results.length > 0
      ? `최근 ${results.length}건의 자료를 바탕으로 '${input.keyword}'의 핵심 내용을 정리했어요. ${firstKoreanSnippet}`.trimEnd()
      : `'${input.keyword}'에 관한 핵심 정보를 한눈에 정리했어요.`

  return {
    keyword: input.keyword,
    summary,
    category: "일반",
    facts,
    sources,
  }
}

interface LLMCurateResult {
  summary: string
  category: string
  facts: string[]
}

function buildCuratePrompt(keyword: string, searchSummary: string): string {
  return `검색 결과를 분석해서 '${keyword}' 카드뉴스에 쓸 핵심 정보를 추출해주세요.

검색 결과:
${searchSummary}

반드시 아래 JSON 형식만 출력하세요:
{
  "summary": "전체 내용을 2~3문장으로 요약 (한국어, 독자 친화적)",
  "category": "카테고리 한 단어 (예: 기술, 경제, 사회, 문화, 과학)",
  "facts": [
    "핵심 사실 문장 1 (간결하고 명확하게)",
    "핵심 사실 문장 2",
    "핵심 사실 문장 3",
    "핵심 사실 문장 4",
    "핵심 사실 문장 5"
  ]
}

조건:
- facts는 5~8개, 각 문장은 40자 이내
- 중복 내용 제거
- 출처 URL, 날짜 표현 제외
- 한국어로만 작성`
}

export const curateAgent: Agent<SearchOutput, CurateOutput> = {
  stepId: "curate",

  async run(input, ctx): Promise<StepResult<CurateOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "curate", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", `정보 정제 시작: "${input.keyword}"`))

    try {
      let output: CurateOutput

      if (ctx.apiKeys.openaiKey) {
        const searchSummary = input.results
          .slice(0, 10)
          .map((r, i) => `[${i + 1}] 제목: ${r.title}\n출처: ${r.url}\n내용: ${r.snippet}`)
          .join("\n\n")

        agentLog.push(log("info", "LLM 핵심 사실 추출 중..."))
        const rawResponse = await callLLM(
          [{ role: "user", content: buildCuratePrompt(input.keyword, searchSummary) }],
          ctx.apiKeys,
          { jsonMode: true, maxTokens: 1000 }
        )

        const json = rawResponse.match(/\{[\s\S]*\}/)
        if (!json) throw new Error("LLM 응답에서 JSON을 찾을 수 없습니다")
        const parsed = JSON.parse(json[0]) as LLMCurateResult

        output = {
          keyword: input.keyword,
          summary: parsed.summary ?? "",
          category: parsed.category ?? "일반",
          facts: Array.isArray(parsed.facts) ? parsed.facts.filter(Boolean) : [],
          sources: input.results.map((r) => r.url).filter(Boolean),
        }
        agentLog.push(log("info", `LLM 핵심 사실 ${output.facts.length}개 추출 완료`))
      } else {
        agentLog.push(log("warn", "API 키 없음 — mock 모드로 사실 추출"))
        output = mockCurate(input)
        agentLog.push(log("info", `mock 사실 ${output.facts.length}개 추출 완료`))
      }

      const completedAt = new Date().toISOString()
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

      ctx.emit({ type: "step:done", jobId: ctx.jobId, stepId: "curate", payload: { output, durationMs }, timestamp: completedAt })

      return { stepId: "curate", status: "done", output, agentLog, startedAt, completedAt, durationMs }
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류"
      agentLog.push(log("error", `정보 정제 실패: ${message}`))
      ctx.emit({ type: "step:error", jobId: ctx.jobId, stepId: "curate", payload: { message }, timestamp: new Date().toISOString() })
      return { stepId: "curate", status: "error", error: { code: "CURATE_FAILED", message, retryable: true }, agentLog, startedAt, completedAt: new Date().toISOString() }
    }
  },
}
