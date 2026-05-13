import type { AgentLogEntry, CurateOutput, SearchOutput, StepResult } from "@/types"
// import { callLLM } from "@/lib/external/llm-client"  // 임시 비활성화
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

function mockCurate(input: SearchOutput): CurateOutput {
  const results = input.results.slice(0, 8)

  const koreanFacts = results
    .filter((r) => r.snippet && r.snippet.length > 20 && containsKorean(r.snippet))
    .map((r) => r.snippet.trim())

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
    results.find((r) => r.snippet && containsKorean(r.snippet))?.snippet?.slice(0, 80) ?? ""
  const summary =
    results.length > 0
      ? `최근 ${results.length}건의 자료를 바탕으로 '${input.keyword}'의 핵심 내용을 정리했어요. ${firstKoreanSnippet}${firstKoreanSnippet ? "..." : ""}`
      : `'${input.keyword}'에 관한 핵심 정보를 한눈에 정리했어요.`

  return {
    keyword: input.keyword,
    summary,
    category: "일반",
    facts,
    sources,
  }
}

export const curateAgent: Agent<SearchOutput, CurateOutput> = {
  stepId: "curate",

  async run(input, ctx): Promise<StepResult<CurateOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "curate", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", `정보 정제 시작: "${input.keyword}"`))

    try {
      /* LLM 호출 임시 비활성화 (429 quota 초과)
      const searchSummary = input.results
        .slice(0, 10)
        .map((r, i) => `[${i + 1}] 제목: ${r.title}\n출처: ${r.url}\n내용: ${r.snippet}`)
        .join("\n\n")
      agentLog.push(log("info", "LLM 핵심 사실 추출 중..."))
      const rawResponse = await callLLM([...], ctx.apiKeys, { jsonMode: true })
      const parsed = JSON.parse(rawResponse) as LLMCurateResult
      */

      agentLog.push(log("info", "검색 결과 기반 사실 추출 중... (mock 모드)"))
      const output = mockCurate(input)
      agentLog.push(log("info", `핵심 사실 ${output.facts.length}개 추출 완료`))

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
