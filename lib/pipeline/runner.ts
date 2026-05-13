import type { ApiKeys, CardSlide, SSEEvent, StepId, StepResult } from "@/types"
import { createJob, getJob, updateJob } from "./state"
import { emitPipelineEvent } from "./emitter"
import { searchAgent } from "@/lib/agents/search-agent"
import { curateAgent } from "@/lib/agents/curate-agent"
import { templateAgent } from "@/lib/agents/template-agent"
import { imageAgent } from "@/lib/agents/image-agent"
import { assembleAgent } from "@/lib/agents/assemble-agent"
import type { AgentContext } from "@/lib/agents/types"

const resumeCallbacks = new Map<string, (slides: CardSlide[]) => void>()

function makeCtx(jobId: string, apiKeys: ApiKeys): AgentContext {
  return {
    jobId,
    apiKeys,
    emit: (event: SSEEvent) => emitPipelineEvent(jobId, event),
  }
}

function markRunning(jobId: string, stepId: StepId): void {
  updateJob(jobId, (s) => ({
    ...s,
    status: "running",
    currentStep: stepId,
    steps: { ...s.steps, [stepId]: { ...s.steps[stepId], status: "running", startedAt: new Date().toISOString() } },
  }))
}

function applyResult<T>(jobId: string, stepId: StepId, result: StepResult<T>): void {
  updateJob(jobId, (s) => ({
    ...s,
    steps: { ...s.steps, [stepId]: result },
    outputs: result.output ? { ...s.outputs, [stepId]: result.output } : s.outputs,
  }))
}

function failPipeline(jobId: string, error: unknown): void {
  updateJob(jobId, (s) => ({ ...s, status: "failed", currentStep: null }))
  emitPipelineEvent(jobId, {
    type: "pipeline:failed",
    jobId,
    payload: error,
    timestamp: new Date().toISOString(),
  })
}

export async function startPipeline(jobId: string, keyword: string, apiKeys: ApiKeys, templateId = "default-6slot"): Promise<void> {
  const ctx = makeCtx(jobId, apiKeys)
  updateJob(jobId, (s) => ({ ...s, status: "running" }))

  // Step 1: search
  markRunning(jobId, "search")
  const searchResult = await searchAgent.run({ keyword }, ctx)
  applyResult(jobId, "search", searchResult)
  if (searchResult.status === "error") return failPipeline(jobId, searchResult.error)

  // Step 2: curate
  markRunning(jobId, "curate")
  const curateResult = await curateAgent.run(searchResult.output!, ctx)
  applyResult(jobId, "curate", curateResult)
  if (curateResult.status === "error") return failPipeline(jobId, curateResult.error)

  // Step 3: template
  markRunning(jobId, "template")
  const templateResult = await templateAgent.run(
    { curateOutput: curateResult.output!, templateId },
    ctx
  )
  applyResult(jobId, "template", templateResult)
  if (templateResult.status === "error") return failPipeline(jobId, templateResult.error)

  // PAUSE: notify frontend that slides are ready for editing
  emitPipelineEvent(jobId, {
    type: "step:progress",
    jobId,
    stepId: "template",
    payload: { ready: true, slides: templateResult.output!.slides },
    timestamp: new Date().toISOString(),
  })
  updateJob(jobId, (s) => ({ ...s, currentStep: null }))

  // Wait for PATCH /slides to resume
  const editedSlides = await new Promise<CardSlide[]>((resolve) => {
    resumeCallbacks.set(jobId, resolve)
  })
  resumeCallbacks.delete(jobId)

  const finalTemplateOutput = { ...templateResult.output!, slides: editedSlides }
  updateJob(jobId, (s) => ({ ...s, outputs: { ...s.outputs, template: finalTemplateOutput } }))

  // Step 4: image
  markRunning(jobId, "image")
  const imageResult = await imageAgent.run(finalTemplateOutput, ctx)
  applyResult(jobId, "image", imageResult)
  if (imageResult.status === "error") return failPipeline(jobId, imageResult.error)

  // Step 5: assemble
  markRunning(jobId, "assemble")
  const assembleResult = await assembleAgent.run(
    {
      imageOutput: imageResult.output!,
      curateOutput: curateResult.output!,
      templateId,
      keyword,
    },
    ctx
  )
  applyResult(jobId, "assemble", assembleResult)
  if (assembleResult.status === "error") return failPipeline(jobId, assembleResult.error)

  updateJob(jobId, (s) => ({ ...s, status: "completed", currentStep: null }))
  emitPipelineEvent(jobId, {
    type: "pipeline:complete",
    jobId,
    payload: assembleResult.output,
    timestamp: new Date().toISOString(),
  })
}

export function resumePipeline(jobId: string, slides: CardSlide[]): boolean {
  const resolve = resumeCallbacks.get(jobId)
  if (!resolve) return false
  resolve(slides)
  return true
}
