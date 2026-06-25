"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { CardNews } from "@/types"

const HISTORY_KEY = "cardnews_history"

interface HistoryItem extends CardNews {
  jobId: string
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as HistoryItem[]
  } catch {
    return []
  }
}

export default function HomePage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(loadHistory()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function handleStart() {
    if (!keyword.trim()) return setError("키워드를 입력해주세요.")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })

      const data = (await response.json()) as { data?: { jobId: string } }
      if (!response.ok || !data.data?.jobId) throw new Error("파이프라인 시작 실패")

      router.push(`/pipeline/${data.data.jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
          키워드 하나로<br />
          <span style={{ color: "var(--color-accent)" }}>카드뉴스</span>를 자동 생성
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: 16 }}>
          5단계 AI 에이전트 파이프라인이 검색부터 이미지까지 자동으로 처리합니다
        </p>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-soft)",
          marginBottom: 40,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-muted)", marginBottom: 8 }}>
            키워드
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="예: 기후변화, 인공지능, 전기차..."
            style={{
              width: "100%",
              padding: "14px 18px",
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text)",
              fontSize: 16,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
        </div>

        {error && (
          <div className="cn-fade-in" style={{ marginBottom: 16, padding: "10px 14px", background: "var(--color-error-soft)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-error)" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={loading || !keyword.trim()}
          style={{
            width: "100%",
            padding: "14px",
            background: loading || !keyword.trim() ? "var(--color-border)" : "var(--color-accent)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            cursor: loading || !keyword.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => { if (!loading && keyword.trim()) e.currentTarget.style.background = "var(--color-accent-hover)" }}
          onMouseLeave={(e) => { if (!loading && keyword.trim()) e.currentTarget.style.background = "var(--color-accent)" }}
        >
          {loading ? <><span className="cn-spinner" /> 시작 중...</> : "카드뉴스 생성 시작 →"}
        </button>
      </div>

      {history.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "var(--color-muted)" }}>최근 생성 이력</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.slice(0, 5).map((item) => (
              <a
                key={item.jobId}
                href={`/pipeline/${item.jobId}/result`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "inherit",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{item.keyword}</span>
                  <span style={{ color: "var(--color-muted)", fontSize: 12, marginLeft: 8 }}>{item.metadata.totalSlides}슬라이드</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--color-faint)" }}>
                  {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
