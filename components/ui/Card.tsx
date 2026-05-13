"use client"

import type { CSSProperties } from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className, style, onClick, hoverable }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-soft)",
        padding: "1.5rem",
        cursor: onClick ? "pointer" : undefined,
        transition: hoverable ? "background 150ms, border-color 150ms, box-shadow 150ms" : undefined,
        ...style,
      }}
      onMouseEnter={
        hoverable && onClick
          ? (e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.background = "var(--color-surface-hover)"
              el.style.borderColor = "var(--color-accent)"
            }
          : undefined
      }
      onMouseLeave={
        hoverable && onClick
          ? (e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.background = "var(--color-surface)"
              el.style.borderColor = "var(--color-border)"
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
