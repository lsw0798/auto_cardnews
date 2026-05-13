import type { AgentLogEntry, SearchOutput, SearchResult, SSEEvent, StepResult } from "@/types"
import { searchWeb } from "@/lib/external/serper-client"
import type { Agent, AgentContext } from "./types"

function log(level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return { timestamp: new Date().toISOString(), level, message }
}

function deduplicateByUrl(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  return results.filter((r) => {
    if (!r.url || seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
}

export const searchAgent: Agent<{ keyword: string }, SearchOutput> = {
  stepId: "search",

  async run(input, ctx): Promise<StepResult<SearchOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "search", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", `검색 시작: "${input.keyword}"`))

    try {
      agentLog.push(log("info", "일반 웹 검색 중..."))
      const webResults = await searchWeb(input.keyword, ctx.apiKeys.serperKey, "search")
      agentLog.push(log("info", `웹 검색 완료: ${webResults.length}개 결과`))

      agentLog.push(log("info", "뉴스 검색 중..."))
      const newsResults = await searchWeb(input.keyword, ctx.apiKeys.serperKey, "news")
      agentLog.push(log("info", `뉴스 검색 완료: ${newsResults.length}개 결과`))

      const combined = deduplicateByUrl([...webResults, ...newsResults])
      agentLog.push(log("info", `중복 제거 후 총 ${combined.length}개 결과`))

      const output: SearchOutput = { keyword: input.keyword, results: combined, totalCount: combined.length }

      const completedAt = new Date().toISOString()
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

      ctx.emit({ type: "step:done", jobId: ctx.jobId, stepId: "search", payload: { output, durationMs }, timestamp: completedAt })

      return { stepId: "search", status: "done", output, agentLog, startedAt, completedAt, durationMs }
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류"
      agentLog.push(log("error", `검색 실패: ${message}`))
      ctx.emit({ type: "step:error", jobId: ctx.jobId, stepId: "search", payload: { message }, timestamp: new Date().toISOString() })
      return { stepId: "search", status: "error", error: { code: "SEARCH_FAILED", message, retryable: true }, agentLog, startedAt, completedAt: new Date().toISOString() }
    }
  },
}
