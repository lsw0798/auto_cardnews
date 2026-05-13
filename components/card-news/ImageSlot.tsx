"use client"

const SOURCE_BADGE: Record<"unsplash" | "dalle" | "placeholder", { label: string; color: string }> = {
  unsplash: { label: "Unsplash", color: "#3b82f6" },
  dalle: { label: "DALL·E", color: "#8b5cf6" },
  placeholder: { label: "Placeholder", color: "#6b7280" },
}

interface ImageSlotProps {
  url: string
  alt: string
  source: "unsplash" | "dalle" | "placeholder"
  credit?: string
  height?: number
}

export function ImageSlot({ url, alt, source, credit, height = 200 }: ImageSlotProps) {
  const badge = SOURCE_BADGE[source]
  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--color-bg)" }}>
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
            img.parentElement.style.background = "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
          }
        }}
      />
      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
        <span style={{ background: badge.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
          {badge.label}
        </span>
      </div>
      {credit && source === "unsplash" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
          Photo by {credit}
        </div>
      )}
    </div>
  )
}
