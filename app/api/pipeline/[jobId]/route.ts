import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { ApiResponse, PipelineState } from "@/types"
import { getJob } from "@/lib/pipeline/state"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  const { jobId } = await params
  const state = getJob(jobId)

  if (!state) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "NOT_FOUND", message: `Job ${jobId}를 찾을 수 없습니다.` } }, { status: 404 })
  }

  return NextResponse.json<ApiResponse<PipelineState>>({ success: true, data: state, error: null })
}
