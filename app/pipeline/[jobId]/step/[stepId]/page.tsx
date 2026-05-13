"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { AgentLogViewer } from "@/components/pipeline/AgentLogViewer"
import { Badge } from "@/components/ui/Badge"
import type { PipelineState, StepId } from "@/types"

const STEP_LABELS: Record<StepId, string> = {
  search: "웹 검색",
  curate: "정보 정제",
  template: "템플릿 구성",
  image: "이미지 수집",
  assemble: "카드뉴스 조립",
}

interface Props {
  params: Promise<{ jobId: string; stepId: string }>
}

export default function StepDetailPage({ params }: Props) {
  const { jobId, stepId } = use(params)
  const [state, setState] = useState<PipelineState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pipeline/${jobId}`)
      .then((r) => r.json())
      .then((data: { data?: PipelineState }) => {
        if (data.data) setState(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId])

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <div className="cn-spinner cn-spinner-lg" style={{ margin: "0 auto" }} />
      </div>
    )
  }

  const step = state?.steps[stepId as StepId]
  if (!state || !step) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
        <p style={{ color: "var(--color-error)" }}>단계 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/pipeline/${jobId}`} style={{ fontSize: 13, color: "var(--color-muted)" }}>
          ← 파이프라인으로 돌아가기
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
          {STEP_LABELS[stepId as StepId] ?? stepId}
        </h1>
        <Badge variant={step.status} />
        {step.durationMs !== undefined && step.status === "done" && (
          <span style={{ fontSize: 13, color: "var(--color-faint)" }}>({(step.durationMs / 1000).toFixed(1)}s)</span>
        )}
      </div>

      {step.error && (
        <div style={{ marginBottom: 24, padding: 16, background: "var(--color-error-soft)", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <p style={{ fontWeight: 700, color: "var(--color-error)", margin: "0 0 4px" }}>{step.error.code}</p>
          <p style={{ color: "var(--color-muted)", fontSize: 13, margin: 0 }}>{step.error.message}</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-muted)", marginBottom: 12, letterSpacing: "0.05em" }}>
            에이전트 로그
          </h2>
          <AgentLogViewer logs={step.agentLog} maxHeight={320} />
        </section>

        {step.output !== undefined && step.output !== null && (
          <section>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-muted)", marginBottom: 12, letterSpacing: "0.05em" }}>
              출력 데이터
            </h2>
            <div
              className="cn-scroll cn-mono"
              style={{
                background: "#0a1020",
                border: "1px solid var(--color-border-soft)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                fontSize: 12,
                lineHeight: 1.6,
                maxHeight: 480,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(step.output, null, 2)}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-muted)", marginBottom: 12, letterSpacing: "0.05em" }}>
            타이밍
          </h2>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "시작", value: step.startedAt ? new Date(step.startedAt).toLocaleTimeString("ko-KR") : "-" },
              { label: "완료", value: step.completedAt ? new Date(step.completedAt).toLocaleTimeString("ko-KR") : "-" },
              { label: "소요", value: step.durationMs !== undefined ? `${(step.durationMs / 1000).toFixed(2)}s` : "-" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "var(--color-faint)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
