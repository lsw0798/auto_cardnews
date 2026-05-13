import { nanoid } from "nanoid"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { ApiKeys, ApiResponse } from "@/types"
import { createJob } from "@/lib/pipeline/state"
import { startPipeline } from "@/lib/pipeline/runner"

function parseApiKeys(header: string | null): ApiKeys | null {
  if (!header) return null
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8")) as ApiKeys
  } catch {
    return null
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKeys = parseApiKeys(req.headers.get("x-api-keys"))
  if (!apiKeys) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "MISSING_API_KEYS", message: "x-api-keys 헤더가 필요합니다." } }, { status: 400 })
  }

  let keyword: string
  let templateId: string | undefined
  try {
    const body = (await req.json()) as { keyword?: string; templateId?: string }
    keyword = body.keyword?.trim() ?? ""
    templateId = body.templateId
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "INVALID_BODY", message: "요청 바디 파싱 실패" } }, { status: 400 })
  }

  if (!keyword) {
    return NextResponse.json<ApiResponse>({ success: false, data: null, error: { code: "MISSING_KEYWORD", message: "keyword가 필요합니다." } }, { status: 400 })
  }

  const jobId = nanoid()
  const state = createJob(jobId, keyword)

  void startPipeline(jobId, keyword, apiKeys, templateId ?? "default-6slot")

  return NextResponse.json<ApiResponse<{ jobId: string; state: typeof state }>>(
    { success: true, data: { jobId, state }, error: null },
    { status: 201 }
  )
}
