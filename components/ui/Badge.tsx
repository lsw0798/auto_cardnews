"use client"

import type { StepStatus } from "@/types"

const statusStyles: Record<StepStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: "var(--color-surface)", color: "var(--color-muted)", label: "대기 중" },
  running: { bg: "rgba(59,130,246,0.18)", color: "#60a5fa", label: "실행 중" },
  done: { bg: "var(--color-success-soft)", color: "var(--color-success)", label: "완료" },
  error: { bg: "var(--color-error-soft)", color: "var(--color-error)", label: "오류" },
}

interface BadgeProps {
  variant?: StepStatus | "info" | "warning"
  children?: React.ReactNode
  className?: string
}

export function Badge({ variant = "info", children, className }: BadgeProps) {
  const isStatus = variant in statusStyles
  const style = isStatus
    ? statusStyles[variant as StepStatus]
    : variant === "warning"
    ? { bg: "var(--color-warning-soft)", color: "var(--color-warning)", label: "" }
    : { bg: "var(--color-accent-soft)", color: "var(--color-accent)", label: "" }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
        background: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {isStatus && variant === "running" && (
        <span className="cn-spinner" style={{ width: 8, height: 8, borderWidth: 1.5 }} />
      )}
      {children ?? style.label}
    </span>
  )
}
