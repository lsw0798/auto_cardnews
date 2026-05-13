"use client"

import { useEffect, useRef, useState } from "react"
import { usePipelineStore } from "@/stores/pipelineStore"
import type {
  PipelineState,
  SSEEvent,
  StepId,
  StepResult,
} from "@/types"

interface StreamState {
  connected: boolean
  error: string | null
}

export function usePipelineStream(jobId: string | null) {
  const setJob = usePipelineStore((s) => s.setJob)
  const updateJob = usePipelineStore((s) => s.updateJob)
  const [state, setState] = useState<StreamState>({
    connected: false,
    error: null,
  })
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!jobId || typeof window === "undefined") return

    let cancelled = false

    // Initial fetch — populate the store immediately so the UI has data
    // even before the first SSE event arrives.
    fetch(`/api/pipeline/${jobId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load job (${r.status})`)
        const json = (await r.json()) as { data?: PipelineState }
        if (!cancelled && json.data) setJob(json.data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            error: err instanceof Error ? err.message : "Unknown error",
          }))
        }
      })

    const es = new EventSource(`/api/pipeline/${jobId}/stream`)
    esRef.current = es

    es.onopen = () => setState({ connected: true, error: null })

    es.onmessage = (event) => {
      try {
        const sse = JSON.parse(event.data) as SSEEvent
        applyEvent(jobId, sse, updateJob, () => {
          es.close()
          esRef.current = null
          setState({ connected: false, error: null })
        })
      } catch {
        // ignore malformed event
      }
    }

    es.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }))
    }

    return () => {
      cancelled = true
      es.close()
      esRef.current = null
    }
  }, [jobId, setJob, updateJob])

  return state
}

function applyEvent(
  jobId: string,
  event: SSEEvent,
  updateJob: (
    jobId: string,
    updater: (state: PipelineState) => PipelineState
  ) => void,
  closeStream?: () => void
) {
  updateJob(jobId, (prev) => {
    const next: PipelineState = {
      ...prev,
      updatedAt: event.timestamp,
    }

    if (event.type === "step:start" && event.stepId) {
      const stepId = event.stepId
      const existing: StepResult = prev.steps[stepId] ?? {
        stepId,
        status: "pending",
        agentLog: [],
      }
      next.currentStep = stepId
      next.status = "running"
      next.steps = {
        ...prev.steps,
        [stepId]: {
          ...existing,
          status: "running",
          startedAt: event.timestamp,
        },
      }
    } else if (event.type === "step:progress" && event.stepId) {
      const stepId = event.stepId
      const existing: StepResult = prev.steps[stepId] ?? {
        stepId,
        status: "running",
        agentLog: [],
      }
      const payload = event.payload as { log?: { level: "info" | "warn" | "error"; message: string } }
      const newLog = payload?.log
        ? [
            ...existing.agentLog,
            {
              timestamp: event.timestamp,
              level: payload.log.level,
              message: payload.log.message,
            },
          ]
        : existing.agentLog
      next.steps = {
        ...prev.steps,
        [stepId]: { ...existing, agentLog: newLog },
      }
    } else if (event.type === "step:done" && event.stepId) {
      const stepId = event.stepId
      const existing: StepResult = prev.steps[stepId] ?? {
        stepId,
        status: "running",
        agentLog: [],
      }
      const payload = event.payload as {
        output?: unknown
        durationMs?: number
      }
      next.steps = {
        ...prev.steps,
        [stepId]: {
          ...existing,
          status: "done",
          output: payload?.output,
          durationMs: payload?.durationMs,
          completedAt: event.timestamp,
        },
      }
      const outputs = { ...prev.outputs }
      if (payload?.output) {
        ;(outputs as Record<string, unknown>)[stepId] = payload.output
      }
      next.outputs = outputs
    } else if (event.type === "step:error" && event.stepId) {
      const stepId = event.stepId
      const existing: StepResult = prev.steps[stepId] ?? {
        stepId,
        status: "running",
        agentLog: [],
      }
      const payload = event.payload as {
        error?: { code: string; message: string; retryable: boolean }
      }
      next.steps = {
        ...prev.steps,
        [stepId]: {
          ...existing,
          status: "error",
          error: payload?.error,
          completedAt: event.timestamp,
        },
      }
      next.status = "failed"
    } else if (event.type === "pipeline:complete") {
      next.status = "completed"
      next.currentStep = null
      closeStream?.()
    } else if (event.type === "pipeline:failed") {
      next.status = "failed"
      next.currentStep = null
      closeStream?.()
    }

    return next
  })
}
