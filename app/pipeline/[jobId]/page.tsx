"use client"

import { use, useState } from "react"
import Link from "next/link"
import { usePipelineStore } from "@/stores/pipelineStore"
import { usePipelineStream } from "@/hooks/usePipelineStream"
import { PipelineTimeline } from "@/components/pipeline/PipelineTimeline"
import { AgentLogViewer } from "@/components/pipeline/AgentLogViewer"
import { TemplateEditor } from "@/components/card-news/TemplateEditor"
import type { AgentLogEntry, CardSlide } from "@/types"

interface Props {
  params: Promise<{ jobId: string }>
}

export default function PipelineJobPage({ params }: Props) {
  const { jobId } = use(params)
  const streamState = usePipelineStream(jobId)
  const job = usePipelineStore((s) => s.jobs[jobId])
  const [editingDone, setEditingDone] = useState(false)

  const isTemplateReady =
    !editingDone &&
    job?.steps.template?.status === "done" &&
    (job?.steps.image?.status === "pending" || !job?.currentStep)

  const activeStep = job?.currentStep
  const activeLogs: AgentLogEntry[] = activeStep ? (job?.steps[activeStep]?.agentLog ?? []) : []

  async function handleSlidesSubmit(slides: CardSlide[]) {
    const response = await fetch(`/api/pipeline/${jobId}/slides`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides }),
    })
    if (!response.ok) {
      let detail = ""
      try {
        const body = (await response.json()) as { error?: { message?: string } }
        detail = body.error?.message ?? ""
      } catch {
        detail = await response.text().catch(() => "")
      }
      throw new Error(`슬라이드 제출 실패 (${response.status})${detail ? `: ${detail}` : ""}`)
    }
    setEditingDone(true)
  }

  if (!job) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <div className="cn-spinner cn-spinner-lg" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "var(--color-muted)" }}>파이프라인 정보를 불러오는 중...</p>
        {streamState.error && (
          <p style={{ color: "var(--color-error)", marginTop: 8 }}>{streamState.error}</p>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>파이프라인 #{jobId.slice(0, 8)}</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
            &ldquo;{job.keyword}&rdquo;
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {job.status === "completed" && (
            <Link
              href={`/pipeline/${jobId}/result`}
              style={{
                padding: "10px 20px",
                background: "var(--color-success)",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
              }}
            >
              카드뉴스 보기 →
            </Link>
          )}
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background:
                job.status === "completed"
                  ? "var(--color-success-soft)"
                  : job.status === "failed"
                  ? "var(--color-error-soft)"
                  : "var(--color-accent-soft)",
              color:
                job.status === "completed"
                  ? "var(--color-success)"
                  : job.status === "failed"
                  ? "var(--color-error)"
                  : "var(--color-accent)",
            }}
          >
            {job.status === "completed" ? "완료" : job.status === "failed" ? "실패" : "실행 중"}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-muted)", marginBottom: 12, letterSpacing: "0.05em" }}>
          파이프라인 진행 현황
        </h2>

        {/* Step 1 완료 표시 */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "var(--color-surface)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "var(--radius-md)", marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-success-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✓</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: "var(--color-faint)", fontWeight: 600 }}>Step 1</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>키워드 입력</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>{job.keyword}</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "var(--color-success-soft)", color: "var(--color-success)" }}>완료</span>
          </div>
        </div>

        <PipelineTimeline state={job} jobId={jobId} />
      </div>

      {activeLogs.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-muted)", marginBottom: 12, letterSpacing: "0.05em" }}>
            에이전트 로그
          </h2>
          <AgentLogViewer logs={activeLogs} />
        </div>
      )}

      {isTemplateReady && job.outputs.template && (
        <div className="cn-fade-in" style={{ marginBottom: 32 }}>
          <div style={{ padding: "16px 20px", background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 600, color: "var(--color-accent)" }}>
              ✏️ 슬라이드 내용을 수정한 후 이미지 생성을 시작하세요
            </p>
          </div>
          <TemplateEditor
            slides={job.outputs.template.slides}
            jobId={jobId}
            onSubmit={handleSlidesSubmit}
          />
        </div>
      )}

      {job.status === "failed" && (
        <div style={{ padding: 20, background: "var(--color-error-soft)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)" }}>
          <p style={{ fontWeight: 700, color: "var(--color-error)", margin: "0 0 4px" }}>파이프라인 실패</p>
          <p style={{ color: "var(--color-muted)", fontSize: 13, margin: 0 }}>단계 카드를 클릭해 상세 에러를 확인하세요.</p>
        </div>
      )}
    </div>
  )
}
