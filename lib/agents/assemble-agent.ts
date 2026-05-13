import { nanoid } from "nanoid"
import type { AgentLogEntry, AssembleOutput, CardNews, CurateOutput, ImageOutput, StepResult } from "@/types"
import type { Agent, AgentContext } from "./types"

function log(level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return { timestamp: new Date().toISOString(), level, message }
}

export const assembleAgent: Agent<
  { imageOutput: ImageOutput; curateOutput: CurateOutput; templateId: string; keyword: string },
  AssembleOutput
> = {
  stepId: "assemble",

  async run(input, ctx): Promise<StepResult<AssembleOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "assemble", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", "카드뉴스 조립 시작"))

    try {
      const coverSlide = input.imageOutput.slides[0]
      const title = coverSlide?.title ?? input.keyword

      const cardNews: CardNews = {
        id: nanoid(),
        keyword: input.keyword,
        title,
        slides: input.imageOutput.slides,
        templateId: input.templateId,
        createdAt: new Date().toISOString(),
        metadata: {
          totalSlides: input.imageOutput.slides.length,
          sources: input.curateOutput.sources,
        },
      }

      const output: AssembleOutput = { cardNews }
      agentLog.push(log("info", `카드뉴스 조립 완료: ${cardNews.slides.length}개 슬라이드`))

      const completedAt = new Date().toISOString()
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

      ctx.emit({ type: "step:done", jobId: ctx.jobId, stepId: "assemble", payload: { output, durationMs }, timestamp: completedAt })

      return { stepId: "assemble", status: "done", output, agentLog, startedAt, completedAt, durationMs }
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류"
      agentLog.push(log("error", `조립 실패: ${message}`))
      ctx.emit({ type: "step:error", jobId: ctx.jobId, stepId: "assemble", payload: { message }, timestamp: new Date().toISOString() })
      return { stepId: "assemble", status: "error", error: { code: "ASSEMBLE_FAILED", message, retryable: false }, agentLog, startedAt, completedAt: new Date().toISOString() }
    }
  },
}
