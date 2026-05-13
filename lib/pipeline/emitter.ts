import { EventEmitter } from "events"
import type { SSEEvent } from "@/types"

export const pipelineEmitter = new EventEmitter()
pipelineEmitter.setMaxListeners(100)

function jobChannel(jobId: string): string {
  return `job:${jobId}`
}

export function emitPipelineEvent(jobId: string, event: SSEEvent): void {
  pipelineEmitter.emit(jobChannel(jobId), event)
}

export function subscribeToJob(jobId: string, handler: (event: SSEEvent) => void): () => void {
  const channel = jobChannel(jobId)
  pipelineEmitter.on(channel, handler)
  return () => pipelineEmitter.off(channel, handler)
}
