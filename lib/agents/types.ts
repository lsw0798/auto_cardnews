import type { ApiKeys, SSEEvent, StepId, StepResult } from "@/types"

export interface AgentContext {
  jobId: string
  apiKeys: ApiKeys
  emit: (event: SSEEvent) => void
}

export interface Agent<TInput, TOutput> {
  readonly stepId: StepId
  run(input: TInput, ctx: AgentContext): Promise<StepResult<TOutput>>
}
