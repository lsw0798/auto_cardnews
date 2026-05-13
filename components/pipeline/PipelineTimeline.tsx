"use client"

import type { PipelineState, StepId } from "@/types"
import { StepCard } from "./StepCard"

const STEP_ORDER: StepId[] = ["search", "curate", "template", "image", "assemble"]

interface PipelineTimelineProps {
  state: PipelineState
  jobId: string
}

export function PipelineTimeline({ state, jobId }: PipelineTimelineProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {STEP_ORDER.map((stepId, index) => {
        const step = state.steps[stepId]
        const isActive = state.currentStep === stepId
        return (
          <StepCard
            key={stepId}
            stepId={stepId}
            status={step?.status ?? "pending"}
            jobId={jobId}
            durationMs={step?.durationMs}
            isActive={isActive}
            stepNumber={index + 2}
          />
        )
      })}
    </div>
  )
}
