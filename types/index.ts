export type StepId = "search" | "curate" | "template" | "image" | "assemble"
export type StepStatus = "pending" | "running" | "done" | "error"
export type SlotType = "cover" | "intro" | "content" | "highlight" | "summary" | "outro"
export type SSEEventType =
  | "step:start"
  | "step:progress"
  | "step:done"
  | "step:error"
  | "pipeline:complete"
  | "pipeline:failed"

export interface AgentLogEntry {
  timestamp: string
  level: "info" | "warn" | "error"
  message: string
}

export interface StepResult<T = unknown> {
  stepId: StepId
  status: StepStatus
  output?: T
  error?: { code: string; message: string; retryable: boolean }
  agentLog: AgentLogEntry[]
  startedAt?: string
  completedAt?: string
  durationMs?: number
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: "web" | "news"
}

export interface SearchOutput {
  keyword: string
  results: SearchResult[]
  totalCount: number
}

export interface CurateOutput {
  keyword: string
  summary: string
  category: string
  facts: string[]
  sources: string[]
}

export interface CardSlide {
  slideIndex: number
  slotType: SlotType
  title: string
  body: string
  subtext?: string
  ctaText?: string
}

export interface TemplateOutput {
  templateId: string
  slides: CardSlide[]
}

export interface CardSlideWithImage extends CardSlide {
  image: {
    url: string
    alt: string
    source: "unsplash" | "dalle" | "placeholder"
    credit?: string
  }
}

export interface ImageOutput {
  slides: CardSlideWithImage[]
}

export interface CardNews {
  id: string
  keyword: string
  title: string
  slides: CardSlideWithImage[]
  templateId: string
  createdAt: string
  metadata: { totalSlides: number; sources: string[] }
}

export interface AssembleOutput {
  cardNews: CardNews
}

export interface PipelineState {
  jobId: string
  keyword: string
  status: "idle" | "running" | "completed" | "failed"
  currentStep: StepId | null
  steps: Record<StepId, StepResult>
  outputs: {
    search?: SearchOutput
    curate?: CurateOutput
    template?: TemplateOutput
    image?: ImageOutput
    assemble?: AssembleOutput
  }
  createdAt: string
  updatedAt: string
}

export interface ApiKeys {
  openaiKey: string
  serperKey: string
  unsplashKey: string
  llmBaseUrl?: string
  llmModel?: string
}

export interface SSEEvent<T = unknown> {
  type: SSEEventType
  jobId: string
  stepId?: StepId
  payload: T
  timestamp: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export interface CardTemplate {
  id: string
  name: string
  description: string
  slots: SlotType[]
}
