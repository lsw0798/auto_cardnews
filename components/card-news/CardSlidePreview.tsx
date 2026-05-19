"use client"

import type { CardSlideWithImage, SlotType } from "@/types"
import { ImageSlot } from "./ImageSlot"

const SLOT_COLORS: Record<SlotType, string> = {
  title:   "#0a0a0a",
  content: "#0a0a0a",
  outro:   "#0a0a0a",
}

interface CardSlidePreviewProps {
  slide: CardSlideWithImage
}

export function CardSlidePreview({ slide }: CardSlidePreviewProps) {
  const bg = SLOT_COLORS[slide.slotType]
  const { slotType, title, body, subtext, image } = slide

  if (slotType === "title") {
    return (
      <div style={{ width: "100%", height: "100%", background: bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ImageSlot url={image.url} alt={image.alt} source={image.source} credit={image.credit} height={500} />
        <div style={{ flex: 1, padding: "48px 60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {subtext && (
            <div style={{ fontSize: 26, fontWeight: 700, color: "#a5b4fc", marginBottom: 20, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {subtext}
            </div>
          )}
          <h1 style={{ fontSize: 72, fontWeight: 900, margin: "0 0 24px", lineHeight: 1.15, color: "#fff" }}>{title}</h1>
          {body && <p style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.6 }}>{body}</p>}
        </div>
      </div>
    )
  }

  const bullets = body ? body.split("\n").filter(Boolean) : []

  return (
    <div style={{ width: "100%", height: "100%", background: bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ImageSlot url={image.url} alt={image.alt} source={image.source} credit={image.credit} height={420} />
      <div style={{ flex: 1, padding: "44px 60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {subtext && (
          <div style={{ fontSize: 24, fontWeight: 700, color: "#a5b4fc", marginBottom: 16, letterSpacing: "0.06em" }}>
            {subtext}
          </div>
        )}
        <h2 style={{ fontSize: 56, fontWeight: 800, margin: "0 0 28px", lineHeight: 1.25, color: "#fff" }}>{title}</h2>
        {bullets.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {bullets.map((line, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, fontSize: 34, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>
                <span style={{ color: "#a5b4fc", fontWeight: 900, flexShrink: 0, marginTop: 2 }}>•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
