import type { AgentLogEntry, CardSlide, CurateOutput, SlotType, StepResult, TemplateOutput } from "@/types"
// import { callLLM } from "@/lib/external/llm-client"  // 임시 비활성화
import type { Agent } from "./types"

function log(level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return { timestamp: new Date().toISOString(), level, message }
}

const SLOT_ORDER: SlotType[] = ["cover", "intro", "content", "content", "highlight", "outro"]

// 사실 텍스트에서 제목으로 쓸 핵심 구절 추출 (첫 문장 혹은 앞 30자)
function factToTitle(fact: string): string {
  const sentence = fact.split(/[.!?。]/)[0]?.trim() ?? fact
  return sentence.length <= 32 ? sentence : sentence.slice(0, 30) + "..."
}

function mockSlides(curate: CurateOutput, templateId: string): CardSlide[] {
  const { keyword, summary, facts } = curate

  // 슬라이드별 고유 사실 할당 — 큐에서 하나씩 꺼냄
  const pool = [...facts]
  const pop = () => pool.shift() ?? `${keyword}에 관한 더 많은 정보를 확인해 보세요.`

  const introFact  = pop()
  const content1   = pop()
  const content2   = pop()
  const highlight  = pop()
  const outrFact   = pop()

  return SLOT_ORDER.map((slotType, slideIndex) => {
    let data: Omit<CardSlide, "slideIndex" | "slotType">

    switch (slotType) {
      case "cover":
        data = {
          title: `${keyword}, 지금 꼭 알아야 할 이유`,
          body: summary,
          subtext: "AI 카드뉴스",
          ctaText: "지금 바로 확인해 보세요 →",
        }
        break
      case "intro":
        data = {
          title: factToTitle(introFact),
          body: introFact,
          subtext: "배경과 현황",
        }
        break
      case "content":
        // SLOT_ORDER 기준으로 첫 번째 content인지 두 번째인지 구분
        if (slideIndex === SLOT_ORDER.indexOf("content")) {
          data = {
            title: factToTitle(content1),
            body: content1,
          }
        } else {
          data = {
            title: factToTitle(content2),
            body: content2,
          }
        }
        break
      case "highlight":
        data = {
          title: "이것만은 꼭 기억해 주세요",
          body: highlight,
          subtext: "핵심 포인트",
        }
        break
      case "summary":
        data = {
          title: "한눈에 보는 핵심 정리",
          body: [introFact, content1, content2].join("\n\n"),
        }
        break
      case "outro":
        data = {
          title: `${keyword}, 앞으로 어떻게 달라질까요?`,
          body: outrFact,
          ctaText: "더 자세한 내용 보러 가기 →",
        }
        break
    }

    return { slideIndex, slotType, ...data }
  })
}

export const templateAgent: Agent<{ curateOutput: CurateOutput; templateId: string }, TemplateOutput> = {
  stepId: "template",

  async run(input, ctx): Promise<StepResult<TemplateOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "template", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", "슬라이드 구성 시작"))

    try {
      const { curateOutput, templateId } = input

      /* LLM 호출 임시 비활성화 (429 quota 초과)
      agentLog.push(log("info", "LLM 슬라이드 생성 중..."))
      const rawResponse = await callLLM([...], ctx.apiKeys, { jsonMode: true, maxTokens: 3000 })
      const parsed = JSON.parse(rawResponse) as { slides?: Record<string, unknown>[] }
      */

      agentLog.push(log("info", "검색 사실 기반 슬라이드 생성 중... (mock 모드)"))
      const slides = mockSlides(curateOutput, templateId)

      const output: TemplateOutput = { templateId, slides }
      agentLog.push(log("info", `슬라이드 ${slides.length}개 생성 완료`))

      const completedAt = new Date().toISOString()
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

      ctx.emit({ type: "step:done", jobId: ctx.jobId, stepId: "template", payload: { output, durationMs }, timestamp: completedAt })

      return { stepId: "template", status: "done", output, agentLog, startedAt, completedAt, durationMs }
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류"
      agentLog.push(log("error", `슬라이드 생성 실패: ${message}`))
      ctx.emit({ type: "step:error", jobId: ctx.jobId, stepId: "template", payload: { message }, timestamp: new Date().toISOString() })
      return { stepId: "template", status: "error", error: { code: "TEMPLATE_FAILED", message, retryable: true }, agentLog, startedAt, completedAt: new Date().toISOString() }
    }
  },
}
