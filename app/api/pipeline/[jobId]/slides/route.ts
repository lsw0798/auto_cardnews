import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { ApiResponse, CardSlide } from "@/types"
import { getJob } from "@/lib/pipeline/state"
import { resumePipeline } from "@/lib/pipeline/runner"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  const { jobId } = await params

  if (!getJob(jobId)) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "NOT_FOUND", message: `Job ${jobId}를 찾을 수 없습니다.` } }, { status: 404 })
  }

  let slides: CardSlide[]
  try {
    const body = (await req.json()) as { slides?: unknown }
    if (!Array.isArray(body.slides)) throw new Error("slides 배열이 필요합니다.")
    slides = body.slides as CardSlide[]
  } catch (err) {
    const message = err instanceof Error ? err.message : "요청 파싱 실패"
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "INVALID_BODY", message } }, { status: 400 })
  }

  const resumed = resumePipeline(jobId, slides)
  if (!resumed) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "NOT_PAUSED", message: "파이프라인이 편집 대기 상태가 아닙니다." } }, { status: 409 })
  }

  return NextResponse.json<ApiResponse<{ resumed: true }>>({ success: true, data: { resumed: true }, error: null })
}
