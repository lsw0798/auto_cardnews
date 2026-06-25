"use client"

import { useEffect, useRef, useState } from "react"
import { usePipelineStore } from "@/stores/pipelineStore"
import type { PipelineState } from "@/types"

interface StreamState {
  connected: boolean
  error: string | null
}

const POLL_INTERVAL_MS = 1500

export function usePipelineStream(jobId: string | null) {
  const setJob = usePipelineStore((s) => s.setJob)
  const [state, setState] = useState<StreamState>({
    connected: false,
    error: null,
  })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!jobId || typeof window === "undefined") return

    let cancelled = false
    const controller = new AbortController()

    async function poll(): Promise<void> {
      try {
        const response = await fetch(`/api/pipeline/${jobId}`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to load job (${response.status})`)
        }

        const json = (await response.json()) as { data?: PipelineState }
        const job = json.data
        if (!job || cancelled) return

        setJob(job)
        setState({ connected: true, error: null })

        if (job.status === "completed" || job.status === "failed") {
          setState({ connected: false, error: null })
          return
        }
      } catch (err) {
        if (!cancelled && !controller.signal.aborted) {
          setState({
            connected: false,
            error: err instanceof Error ? err.message : "Unknown error",
          })
        }
      }

      if (!cancelled) {
        timeoutRef.current = setTimeout(() => {
          void poll()
        }, POLL_INTERVAL_MS)
      }
    }

    void poll()

    return () => {
      cancelled = true
      controller.abort()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [jobId, setJob])

  return state
}
