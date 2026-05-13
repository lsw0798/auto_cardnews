"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import type { StepId, StepStatus } from "@/types"

const STEP_META: Record<StepId, { label: string; icon: string; description: string }> = {
  search: { label: "웹 검색", icon: "🔍", description: "Serper API로 키워드 검색" },
  curate: { label: "정보 정제", icon: "✂️", description: "LLM으로 핵심 사실 추출" },
  template: { label: "템플릿 구성", icon: "📝", description: "LLM으로 슬라이드 생성" },
  image: { label: "이미지 수집", icon: "🖼", description: "Unsplash → DALL-E fallback" },
  assemble: { label: "카드뉴스 조립", icon: "⚡", description: "최종 데이터 조립" },
}

interface StepCardProps {
  stepId: StepId
  status: StepStatus
  jobId: string
  durationMs?: number
  isActive?: boolean
  stepNumber: number
}

export function StepCard({ stepId, status, jobId, durationMs, isActive, stepNumber }: StepCardProps) {
  const meta = STEP_META[stepId]

  return (
    <Link href={`/pipeline/${jobId}/step/${stepId}`} style={{ textDecoration: "none" }}>
      <div
        className={isActive ? "cn-running-glow" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          background: isActive ? "rgba(99,102,241,0.06)" : "var(--color-surface)",
          border: `1px solid ${isActive ? "var(--color-accent)" : status === "done" ? "rgba(34,197,94,0.3)" : status === "error" ? "rgba(239,68,68,0.3)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          transition: "background 150ms, border-color 150ms",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-hover)" }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "rgba(99,102,241,0.06)" : "var(--color-surface)" }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            background: status === "done"
              ? "var(--color-success-soft)"
              : status === "running"
              ? "var(--color-accent-soft)"
              : status === "error"
              ? "var(--color-error-soft)"
              : "var(--color-bg)",
            flexShrink: 0,
          }}
        >
          {status === "done" ? "✓" : status === "running" ? <span className="cn-spinner" /> : meta.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 12, color: "var(--color-faint)", fontWeight: 600 }}>Step {stepNumber}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{meta.label}</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>{meta.description}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <Badge variant={status}>{status === "done" ? "완료" : status === "running" ? "실행 중" : status === "error" ? "오류" : "대기"}</Badge>
          {durationMs !== undefined && status === "done" && (
            <span style={{ fontSize: 11, color: "var(--color-faint)" }}>
              {(durationMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
