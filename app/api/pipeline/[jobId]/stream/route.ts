import type { NextRequest } from "next/server"
import { subscribeToJob } from "@/lib/pipeline/emitter"
import { getJob } from "@/lib/pipeline/state"
import type { SSEEvent } from "@/types"

function sseMessage(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<Response> {
  const { jobId } = await params

  const job = getJob(jobId)
  if (!job) return new Response("Job not found", { status: 404 })

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      function send(event: SSEEvent): void {
        try {
          controller.enqueue(encoder.encode(sseMessage(event)))
        } catch {
          // client disconnected
        }
      }

      // Send current state immediately
      send({ type: "step:progress", jobId, payload: { init: true, state: job }, timestamp: new Date().toISOString() })

      const unsubscribe = subscribeToJob(jobId, (event) => {
        send(event)
        if (event.type === "pipeline:complete" || event.type === "pipeline:failed") {
          unsubscribe()
          try { controller.close() } catch { /* already closed */ }
        }
      })

      req.signal.addEventListener("abort", () => {
        unsubscribe()
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
