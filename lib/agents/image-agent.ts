import type { AgentLogEntry, CardSlide, CardSlideWithImage, ImageOutput, StepResult, TemplateOutput } from "@/types"
import { searchUnsplashImage } from "@/lib/external/unsplash-client"
import { generateDalleImage } from "@/lib/external/dalle-client"
import type { Agent, AgentContext } from "./types"

function log(level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return { timestamp: new Date().toISOString(), level, message }
}

function placeholderUrl(title: string): string {
  const label = (title.slice(0, 24) || "이미지").replace(/[<>&"]/g, " ")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="500"><rect width="1080" height="500" fill="#1e293b"/><text x="540" y="265" font-family="system-ui,sans-serif" font-size="32" fill="#475569" text-anchor="middle">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

async function fetchImageForSlide(slide: CardSlide, ctx: AgentContext): Promise<CardSlideWithImage> {
  const query = `${slide.title} ${slide.slotType}`

  if (ctx.apiKeys.unsplashKey) {
    const unsplash = await searchUnsplashImage(query, ctx.apiKeys.unsplashKey)
    if (unsplash) {
      return { ...slide, image: { url: unsplash.url, alt: unsplash.alt, source: "unsplash", credit: unsplash.credit } }
    }
  }

  if (ctx.apiKeys.openaiKey) {
    const dalle = await generateDalleImage(`카드뉴스 이미지: ${slide.title}. 깔끔하고 전문적인 스타일`, ctx.apiKeys)
    if (dalle) {
      return { ...slide, image: { url: dalle.url, alt: slide.title, source: "dalle" } }
    }
  }

  return { ...slide, image: { url: placeholderUrl(slide.title), alt: slide.title, source: "placeholder" } }
}

export const imageAgent: Agent<TemplateOutput, ImageOutput> = {
  stepId: "image",

  async run(input, ctx): Promise<StepResult<ImageOutput>> {
    const agentLog: AgentLogEntry[] = []
    const startedAt = new Date().toISOString()

    ctx.emit({ type: "step:start", jobId: ctx.jobId, stepId: "image", payload: {}, timestamp: startedAt })
    agentLog.push(log("info", `이미지 수집 시작: ${input.slides.length}개 슬라이드`))

    try {
      const results = await Promise.allSettled(input.slides.map((slide) => fetchImageForSlide(slide, ctx)))

      const slides: CardSlideWithImage[] = results.map((result, index) => {
        if (result.status === "fulfilled") {
          agentLog.push(log("info", `슬라이드 ${index + 1} 이미지 완료 (${result.value.image.source})`))
          return result.value
        }
        agentLog.push(log("warn", `슬라이드 ${index + 1} 이미지 실패, placeholder 사용`))
        const slide = input.slides[index]
        return { ...slide, image: { url: placeholderUrl(slide.title), alt: slide.title, source: "placeholder" as const } }
      })

      const output: ImageOutput = { slides }
      const completedAt = new Date().toISOString()
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

      ctx.emit({ type: "step:done", jobId: ctx.jobId, stepId: "image", payload: { output, durationMs }, timestamp: completedAt })

      return { stepId: "image", status: "done", output, agentLog, startedAt, completedAt, durationMs }
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류"
      agentLog.push(log("error", `이미지 수집 실패: ${message}`))
      ctx.emit({ type: "step:error", jobId: ctx.jobId, stepId: "image", payload: { error: { code: "IMAGE_FAILED", message, retryable: true } }, timestamp: new Date().toISOString() })
      return { stepId: "image", status: "error", error: { code: "IMAGE_FAILED", message, retryable: true }, agentLog, startedAt, completedAt: new Date().toISOString() }
    }
  },
}
