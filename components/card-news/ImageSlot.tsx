"use client"

interface ImageSlotProps {
  url: string
  alt: string
  source: "unsplash" | "dalle" | "placeholder"
  credit?: string
  height?: number
}

export function ImageSlot({ url, alt, source, credit, height = 200 }: ImageSlotProps) {
  if (source === "placeholder" || !url) {
    return (
      <div
        style={{
          width: "100%",
          height,
          flexShrink: 0,
          background: "#0f1d36",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>
          이미지 영역
        </span>
      </div>
    )
  }

  return (
    <div style={{ position: "relative", width: "100%", height, flexShrink: 0, overflow: "hidden", background: "#0f1d36" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget
          img.style.display = "none"
          if (img.parentElement) {
            img.parentElement.style.background = "#0f1d36"
          }
        }}
      />
      {credit && source === "unsplash" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
          Photo by {credit}
        </div>
      )}
    </div>
  )
}
