"use client"

interface ProgressProps {
  value: number
  label?: string
  showPercent?: boolean
}

export function Progress({ value, label, showPercent }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div>
      {(label || showPercent) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--color-muted)" }}>
          {label && <span>{label}</span>}
          {showPercent && <span>{clamped}%</span>}
        </div>
      )}
      <div
        style={{
          height: 6,
          borderRadius: 4,
          background: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${clamped}%`,
            borderRadius: 4,
            background: "linear-gradient(90deg, var(--color-accent), #8b5cf6)",
            transition: "width 400ms ease",
          }}
        />
      </div>
    </div>
  )
}
