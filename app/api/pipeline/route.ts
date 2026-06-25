import { nanoid } from "nanoid"
import { waitUntil } from "@vercel/functions"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { ApiResponse } from "@/types"
import { loadApiKeysFromEnv, validateApiKeys } from "@/lib/config/api-keys"
import { createJob } from "@/lib/pipeline/state"
import { startPipeline } from "@/lib/pipeline/runner"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKeys = loadApiKeysFromEnv()
  const keyError = validateApiKeys(apiKeys)
  if (keyError) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "MISSING_API_KEYS", message: keyError } }, { status: 500 })
  }

  let keyword: string
  try {
    const body = (await req.json()) as { keyword?: string }
    keyword = body.keyword?.trim() ?? ""
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "INVALID_BODY", message: "요청 바디 파싱 실패" } }, { status: 400 })
  }

  if (!keyword) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "MISSING_KEYWORD", message: "keyword가 필요합니다." } }, { status: 400 })
  }

  const jobId = nanoid()
  const state = await createJob(jobId, keyword)

  waitUntil(startPipeline(jobId, keyword, apiKeys))

  return NextResponse.json<ApiResponse<{ jobId: string; state: typeof state }>>(
    { success: true, data: { jobId, state }, error: null },
    { status: 201 }
  )
}
