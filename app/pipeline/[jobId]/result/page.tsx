"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { CardNewsGallery } from "@/components/card-news/CardNewsGallery"
import type { CardNews, PipelineState } from "@/types"

const HISTORY_KEY = "cardnews_history"

interface HistoryItem extends CardNews {
  jobId: string
}

function saveToHistory(news: CardNews, jobId: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as HistoryItem[]
    const filtered = existing.filter((n) => n.jobId !== jobId)
    const item: HistoryItem = { ...news, jobId }
    localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...filtered].slice(0, 20)))
  } catch {
    // ignore
  }
}

interface Props {
  params: Promise<{ jobId: string }>
}

export default function ResultPage({ params }: Props) {
  const { jobId } = use(params)
  const [cardNews, setCardNews] = useState<CardNews | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pipeline/${jobId}`)
      .then((r) => r.json())
      .then((data: { data?: PipelineState }) => {
        const state = data.data
        if (!state) throw new Error("파이프라인 정보 없음")

        if (state.status !== "completed") {
          throw new Error("파이프라인이 아직 완료되지 않았습니다.")
        }

        const news = state.outputs.assemble?.cardNews
        if (!news) throw new Error("카드뉴스 데이터 없음")

        saveToHistory(news, jobId)
        setCardNews(news)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "오류 발생"))
      .finally(() => setLoading(false))
  }, [jobId])

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <div className="cn-spinner cn-spinner-lg" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "var(--color-muted)" }}>카드뉴스를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ padding: 20, background: "var(--color-error-soft)", borderRadius: "var(--radius-md)", marginBottom: 20 }}>
          <p style={{ color: "var(--color-error)", margin: 0 }}>{error}</p>
        </div>
        <Link href={`/pipeline/${jobId}`} style={{ color: "var(--color-accent)" }}>← 파이프라인으로 돌아가기</Link>
      </div>
    )
  }

  if (!cardNews) return null

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/pipeline/${jobId}`} style={{ fontSize: 13, color: "var(--color-muted)" }}>
          ← 파이프라인으로 돌아가기
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>{cardNews.title}</h1>
          <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
            키워드: <strong>{cardNews.keyword}</strong> · {cardNews.metadata.totalSlides}슬라이드 · {new Date(cardNews.createdAt).toLocaleDateString("ko-KR")}
          </div>
        </div>
      </div>

      {cardNews.metadata.sources.length > 0 && (
        <div style={{ marginBottom: 24, padding: "12px 16px", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", marginBottom: 6 }}>출처</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {cardNews.metadata.sources.slice(0, 5).map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--color-accent)" }}>
                {src}
              </a>
            ))}
          </div>
        </div>
      )}

      <CardNewsGallery slides={cardNews.slides} keyword={cardNews.keyword} />
    </div>
  )
}
