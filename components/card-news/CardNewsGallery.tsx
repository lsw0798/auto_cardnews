"use client"

import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import type { CardSlideWithImage } from "@/types"
import { CardSlidePreview } from "./CardSlidePreview"

const CARD_W = 1080
const CARD_H = 1350
const DISPLAY_W = 432  // 화면에 보여줄 너비 (scale = 432/1080 = 0.4)

interface CardNewsGalleryProps {
  slides: CardSlideWithImage[]
  keyword: string
}

export function CardNewsGallery({ slides, keyword }: CardNewsGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  const scale = DISPLAY_W / CARD_W
  const displayH = Math.round(CARD_H * scale)

  const prev = () => setCurrent((c) => Math.max(0, c - 1))
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1))

  async function downloadAll() {
    setDownloading(true)
    try {
      for (let i = 0; i < slides.length; i++) {
        const el = slideRefs.current[i]
        if (!el) continue
        const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 1, width: CARD_W, height: CARD_H })
        const link = document.createElement("a")
        link.download = `${keyword}-${i + 1}.png`
        link.href = dataUrl
        link.click()
        await new Promise((r) => setTimeout(r, 300))
      }
    } catch {
      alert("다운로드 실패")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* 전체 다운로드 버튼 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={downloadAll}
          disabled={downloading}
          style={{
            padding: "10px 22px",
            background: downloading ? "var(--color-border)" : "var(--color-accent)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: downloading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {downloading ? <><span className="cn-spinner" /> 저장 중...</> : "↓ 전체 이미지 저장"}
        </button>
      </div>

      {/* 슬라이드 뷰어 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* 카드 + 좌우 버튼 */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button
            onClick={prev}
            disabled={current === 0}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: current === 0 ? "var(--color-border)" : "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: current === 0 ? "var(--color-muted)" : "var(--color-text)",
              fontSize: 20, cursor: current === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ‹
          </button>

          {/* 스케일 뷰어 */}
          <div
            style={{
              width: DISPLAY_W,
              height: displayH,
              overflow: "hidden",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <CardSlidePreview slide={slides[current]} />
            </div>
          </div>

          <button
            onClick={next}
            disabled={current === slides.length - 1}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: current === slides.length - 1 ? "var(--color-border)" : "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: current === slides.length - 1 ? "var(--color-muted)" : "var(--color-text)",
              fontSize: 20, cursor: current === slides.length - 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ›
          </button>
        </div>

        {/* 페이지 표시 */}
        <div style={{ fontSize: 14, color: "var(--color-muted)", fontWeight: 600 }}>
          {current + 1} / {slides.length}
        </div>

        {/* 도트 인디케이터 */}
        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === current ? "var(--color-accent)" : "var(--color-border)",
                cursor: "pointer",
                transition: "all 200ms",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* 실제 크기 슬라이드 (다운로드용, 화면 밖에 렌더링) */}
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1, pointerEvents: "none" }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { slideRefs.current[i] = el }}
            style={{ width: CARD_W, height: CARD_H }}
          >
            <CardSlidePreview slide={slide} />
          </div>
        ))}
      </div>
    </div>
  )
}
