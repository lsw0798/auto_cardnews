"use client"

import { useState, useRef } from "react"
import type { CardSlideWithImage } from "@/types"
import { CardSlidePreview } from "./CardSlidePreview"

const CARD_W = 1080
const CARD_H = 1350
const DISPLAY_W = 400
const SIDE_W = 200

interface CardNewsGalleryProps {
  slides: CardSlideWithImage[]
  keyword: string
}

async function downloadAllPng(slides: CardSlideWithImage[], keyword: string, containerRef: React.RefObject<HTMLDivElement | null>) {
  const { default: html2canvas } = await import("html2canvas")
  const container = containerRef.current
  if (!container) return

  const nodes = container.querySelectorAll<HTMLElement>("[data-slide-index]")

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const canvas = await html2canvas(node, {
      width: CARD_W,
      height: CARD_H,
      scale: 1,
      useCORS: true,
      backgroundColor: "#0a0a0a",
      logging: false,
    })

    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${keyword}-${String(i + 1).padStart(2, "0")}.png`
        a.click()
        URL.revokeObjectURL(url)
        resolve()
      }, "image/png")
    })

    // 브라우저가 다운로드 다이얼로그를 처리할 시간
    await new Promise((r) => setTimeout(r, 400))
  }
}

function SlideFrame({
  slide,
  displayW,
  onClick,
  dimmed,
}: {
  slide: CardSlideWithImage
  displayW: number
  onClick?: () => void
  dimmed: boolean
}) {
  const scale = displayW / CARD_W
  const displayH = Math.round(CARD_H * scale)

  return (
    <div
      onClick={onClick}
      style={{
        width: displayW,
        height: displayH,
        overflow: "hidden",
        borderRadius: 10,
        boxShadow: dimmed ? "0 4px 16px rgba(0,0,0,0.2)" : "0 8px 32px rgba(0,0,0,0.4)",
        flexShrink: 0,
        opacity: dimmed ? 0.45 : 1,
        transition: "opacity 200ms",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        <CardSlidePreview slide={slide} />
      </div>
    </div>
  )
}

export function CardNewsGallery({ slides, keyword }: CardNewsGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const prev = () => setCurrent((c) => Math.max(0, c - 1))
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1))

  const hasPrev = current > 0
  const hasNext = current < slides.length - 1

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadAllPng(slides, keyword, captureRef)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* PNG 저장 버튼 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={handleDownload}
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
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.background = "var(--color-accent-hover)" }}
          onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.background = "var(--color-accent)" }}
        >
          {downloading ? `저장 중... (${slides.length}장)` : `↓ PNG로 저장 (${slides.length}장)`}
        </button>
      </div>

      {/* 슬라이드 뷰어 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={prev}
            disabled={!hasPrev}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: !hasPrev ? "var(--color-border)" : "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: !hasPrev ? "var(--color-muted)" : "var(--color-text)",
              fontSize: 20, cursor: !hasPrev ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ‹
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {hasPrev && <SlideFrame slide={slides[current - 1]} displayW={SIDE_W} onClick={prev} dimmed />}
            <SlideFrame slide={slides[current]} displayW={DISPLAY_W} dimmed={false} />
            {hasNext && <SlideFrame slide={slides[current + 1]} displayW={SIDE_W} onClick={next} dimmed />}
          </div>

          <button
            onClick={next}
            disabled={!hasNext}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: !hasNext ? "var(--color-border)" : "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: !hasNext ? "var(--color-muted)" : "var(--color-text)",
              fontSize: 20, cursor: !hasNext ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ›
          </button>
        </div>

        <div style={{ fontSize: 14, color: "var(--color-muted)", fontWeight: 600 }}>
          {current + 1} / {slides.length}
        </div>

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

      {/* 캡처용 숨김 컨테이너 (화면 밖) */}
      <div
        ref={captureRef}
        style={{ position: "fixed", top: 0, left: "-9999px", pointerEvents: "none" }}
        aria-hidden="true"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            data-slide-index={i}
            style={{ width: CARD_W, height: CARD_H, overflow: "hidden" }}
          >
            <CardSlidePreview slide={slide} />
          </div>
        ))}
      </div>
    </div>
  )
}
