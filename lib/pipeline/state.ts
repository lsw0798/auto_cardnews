import type { PipelineState, StepId, StepResult } from "@/types"

const ALL_STEPS: StepId[] = ["search", "curate", "template", "image", "assemble"]

function makeInitialStepResult(stepId: StepId): StepResult {
  return { stepId, status: "pending", agentLog: [] }
}

function makeInitialSteps(): Record<StepId, StepResult> {
  return Object.fromEntries(ALL_STEPS.map((id) => [id, makeInitialStepResult(id)])) as Record<StepId, StepResult>
}

const jobStore = new Map<string, PipelineState>()

export function createJob(jobId: string, keyword: string): PipelineState {
  const now = new Date().toISOString()
  const state: PipelineState = {
    jobId,
    keyword,
    status: "idle",
    currentStep: null,
    steps: makeInitialSteps(),
    outputs: {},
    createdAt: now,
    updatedAt: now,
  }
  jobStore.set(jobId, state)
  return state
}

export function getJob(jobId: string): PipelineState | undefined {
  return jobStore.get(jobId)
}

export function updateJob(
  jobId: string,
  updater: (state: PipelineState) => PipelineState
): PipelineState | undefined {
  const current = jobStore.get(jobId)
  if (!current) return undefined
  const updated = updater({ ...current, updatedAt: new Date().toISOString() })
  jobStore.set(jobId, updated)
  return updated
}

export function listJobs(): PipelineState[] {
  return Array.from(jobStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
