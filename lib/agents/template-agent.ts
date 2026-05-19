import type { AgentLogEntry, CardSlide, CurateOutput, SlotType, StepResult, TemplateOutput } from "@/types"
import { callLLM } from "@/lib/external/llm-client"
import { EXAMPLE_FEEDS } from "@/lib/examples/example-feeds"
import type { Agent } from "./types"

function log(level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return { timestamp: new Date().toISOString(), level, message }
}

// 예시 한 건을 few-shot 레퍼런스로 직렬화
function buildFewShotExample(): string {
  const ex = EXAMPLE_FEEDS[0]
  return JSON.stringify({ keyword: ex.keyword, slides: ex.slides }, null, 2)
}

function buildSystemPrompt(): string {
  return `당신은 SNS 카드뉴스 작가입니다.
독자가 스크롤을 멈추게 만드는 카드뉴스를 생성합니다.

슬롯 타입은 세 가지만 사용합니다:
- "title" : 표지. 강렬한 한 줄 제목, body는 빈 문자열 ""
- "content": 본문. 독자의 내면 반응처럼 들리는 구어체 title + 핵심 요약 subtext + 개행(\\n)으로 구분된 짧은 문장 3~5개 body
- "outro"  : 마무리. 평가·전망·결론, subtext 포함

스타일 원칙:
1. title(제목)은 독자의 생각이나 반응처럼 쓴다. 예: "얘 왜 혼자 일하는 것처럼 보이냐고", "근데 왜 이렇게까지 난리였을까"
2. subtext는 해당 슬라이드 내용을 한 줄로 날카롭게 정리
3. body는 개행(\\n)으로 구분한 짧은 문장들. 마크다운 불릿(-) 금지
4. 전체 톤은 친근하고 가볍되 정보는 정확하게
5. 슬라이드 수는 5~8개

다음 예시를 참고하여 동일한 말투·구성으로 생성하세요:
${buildFewShotExample()}

응답은 반드시 아래 JSON 형식만 출력하세요. 설명 텍스트 없이 JSON만:
{
  "slides": [
    { "slideIndex": 1, "slotType": "title", "title": "...", "body": "" },
    { "slideIndex": 2, "slotType": "content", "title": "...", "subtext": "...", "body": "...\\n...\\n..." },
    { "slideIndex": N, "slotType": "outro", "title": "...", "subtext": "...", "body": "...\\n...\\n..." }
  ]
}`
}

function buildUserPrompt(curate: CurateOutput): string {
  const facts = curate.facts.map((f, i) => `${i + 1}. ${f}`).join("\n")
  return `키워드: ${curate.keyword}
요약: ${curate.summary}
핵심 사실:
${facts}

위 내용으로 카드뉴스를 만들어주세요.`
}

interface LLMSlideResult {
  slideIndex: number
  slotType: string
  title: string
  body: string
  subtext?: string
}

function parseSlides(raw: string): CardSlide[] {
  const json = raw.match(/\{[\s\S]*\}/)
  if (!json) throw new Error("JSON 블록을 찾을 수 없습니다")

  const parsed = JSON.parse(json[0]) as { slides: LLMSlideResult[] }
  const validSlotTypes = new Set<SlotType>(["title", "content", "outro"])

  return parsed.slides.map((s, i) => {
    const slotType: SlotType = validSlotTypes.has(s.slotType as SlotType)
      ? (s.slotType as SlotType)
      : "content"
    return {
      slideIndex: s.slideIndex ?? i + 1,
      slotType,
      title: s.title ?? "",
      body: s.body ?? "",
      ...(s.subtext ? { subtext: s.subtext } : {}),
    }
  })
}

// LLM 없이 동작하는 구조적 폴백
function mockBuildSlides(curate: CurateOutput): CardSlide[] {
  const { keyword, facts } = curate
  const pool = [...facts]
  const pop = () => pool.shift() ?? `${keyword}에 대해 더 알아보세요.`

  const slides: CardSlide[] = [
    {
      slideIndex: 1,
      slotType: "title",
      title: `${keyword}, 지금 꼭 알아야 할 이유`,
      body: "",
    },
  ]

  const contentFacts = facts.slice(0, Math.min(facts.length - 1, 5))
  contentFacts.forEach((fact, i) => {
    slides.push({
      slideIndex: slides.length + 1,
      slotType: "content",
      title: fact.split(/[.!?。]/)[0]?.trim() ?? fact,
      subtext: `${i + 1}번째 포인트`,
      body: fact,
    })
  })

  slides.push({
    slideIndex: slides.length + 1,
    slotType: "outro",
    title: `${keyword}, 앞으로 어떻게 달라질까요?`,
    subtext: "정리 및 전망",
    body: pop(),
  })

  return slides
}

export const templateAgent: Agent<{ curateOutput: CurateOutput }, TemplateOutput> = {
  stepId: "template",

  async run(input, ctx): Promise<StepResult<TemplateOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "template", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", "슬라이드 구성 시작"))

    try {
      const { curateOutput } = input
      let slides: CardSlide[]

      if (ctx.apiKeys.openaiKey) {
        agentLog.push(log("info", "LLM 카드뉴스 생성 중..."))
        const raw = await callLLM(
          [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: buildUserPrompt(curateOutput) },
          ],
          ctx.apiKeys,
          { jsonMode: true, maxTokens: 3000 }
        )
        slides = parseSlides(raw)
        agentLog.push(log("info", `LLM 슬라이드 ${slides.length}개 생성 완료`))
      } else {
        agentLog.push(log("warn", "API 키 없음 — mock 슬라이드 생성"))
        slides = mockBuildSlides(curateOutput)
        agentLog.push(log("info", `mock 슬라이드 ${slides.length}개 생성 완료`))
      }

      const output: TemplateOutput = { templateId: "llm-generated", slides }
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
