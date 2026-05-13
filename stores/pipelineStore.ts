"use client"

import { create } from "zustand"
import type { PipelineState } from "@/types"

interface PipelineStore {
  jobs: Record<string, PipelineState>
  setJob: (state: PipelineState) => void
  updateJob: (
    jobId: string,
    updater: (state: PipelineState) => PipelineState
  ) => void
  removeJob: (jobId: string) => void
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  jobs: {},
  setJob: (state) =>
    set((s) => ({ jobs: { ...s.jobs, [state.jobId]: state } })),
  updateJob: (jobId, updater) =>
    set((s) => {
      const existing = s.jobs[jobId]
      if (!existing) return s
      return { jobs: { ...s.jobs, [jobId]: updater(existing) } }
    }),
  removeJob: (jobId) =>
    set((s) => {
      const next = { ...s.jobs }
      delete next[jobId]
      return { jobs: next }
    }),
}))
