import { NextResponse } from "next/server"
import type { ApiResponse, CardTemplate } from "@/types"
import { DEFAULT_TEMPLATE } from "@/lib/templates/default-template"

export function GET(): NextResponse {
  return NextResponse.json<ApiResponse<CardTemplate[]>>({ success: true, data: [DEFAULT_TEMPLATE], error: null })
}
