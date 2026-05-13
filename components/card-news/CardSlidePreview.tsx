"use client"

import type { CardSlideWithImage, SlotType } from "@/types"
import { ImageSlot } from "./ImageSlot"

const SLOT_COLORS: Record<SlotType, string> = {
  cover:     "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)",
  intro:     "linear-gradient(160deg, #0c4a6e 0%, #075985 100%)",
  content:   "var(--color-surface)",
  highlight: "linear-gradient(160deg, #3b0764 0%, #581c87 100%)",
  summary:   "linear-gradient(160deg, #052e16 0%, #14532d 100%)",
  outro:     "linear-gradient(160deg, #1c1917 0%, #292524 100%)",
}

interface CardSlidePreviewProps {
  slide: CardSlideWithImage
}

export function CardSlidePreview({ slide }: CardSlidePreviewProps) {
  const bg = SLOT_COLORS[slide.slotType]
  const { slotType, title, body, subtext, ctaText, image } = slide

  if (slotType === "cover") {
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
          {body && <p style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", margin: "0 0 32px", lineHeight: 1.6 }}>{body}</p>}
          {ctaText && (
            <div style={{ display: "inline-block", padding: "16px 36px", background: "var(--color-accent)", borderRadius: 12, fontSize: 26, fontWeight: 700, color: "#fff" }}>
              {ctaText}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (slotType === "highlight") {
    return (
      <div style={{ width: "100%", height: "100%", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 72px", textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#c084fc", marginBottom: 40, letterSpacing: "0.12em" }}>✦ HIGHLIGHT ✦</div>
        <h2 style={{ fontSize: 72, fontWeight: 900, margin: "0 0 36px", lineHeight: 1.2, color: "#fff" }}>{title}</h2>
        {body && <p style={{ fontSize: 34, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.65 }}>{body}</p>}
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", background: bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ImageSlot url={image.url} alt={image.alt} source={image.source} credit={image.credit} height={440} />
      <div style={{ flex: 1, padding: "44px 60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-muted)", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {slotType}
        </div>
        <h2 style={{ fontSize: 52, fontWeight: 800, margin: "0 0 24px", lineHeight: 1.25, color: "#fff" }}>{title}</h2>
        {body && <p style={{ fontSize: 28, color: "rgba(255,255,255,0.72)", margin: "0 0 24px", lineHeight: 1.65 }}>{body}</p>}
        {ctaText && <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-accent)" }}>{ctaText}</div>}
      </div>
    </div>
  )
}
