"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const SIZE_STYLES: Record<Size, { padding: string; fontSize: number; height: number }> = {
  sm: { padding: "0 10px", fontSize: 13, height: 32 },
  md: { padding: "0 14px", fontSize: 14, height: 38 },
  lg: { padding: "0 18px", fontSize: 15, height: 46 },
}

function variantStyles(variant: Variant, disabled: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    border: "1px solid transparent",
    borderRadius: 10,
    fontWeight: 600,
    transition: "background 160ms ease, border-color 160ms ease, transform 80ms ease, color 160ms ease",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "-0.01em",
  }
  switch (variant) {
    case "primary":
      return {
        ...base,
        background: "var(--color-accent)",
        color: "#fff",
        boxShadow: "0 6px 18px rgba(99,102,241,0.35)",
      }
    case "secondary":
      return {
        ...base,
        background: "var(--color-surface)",
        color: "var(--color-text)",
        borderColor: "var(--color-border)",
      }
    case "ghost":
      return {
        ...base,
        background: "transparent",
        color: "var(--color-muted)",
      }
    case "danger":
      return {
        ...base,
        background: "var(--color-error)",
        color: "#fff",
      }
    default:
      return base
  }
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  iconLeft,
  iconRight,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const sz = SIZE_STYLES[size]
  const isDisabled = disabled || loading

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={`cn-focus-ring ${rest.className ?? ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: sz.height,
        padding: sz.padding,
        fontSize: sz.fontSize,
        ...variantStyles(variant, Boolean(isDisabled)),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          if (variant === "primary") e.currentTarget.style.background = "var(--color-accent-hover)"
          else if (variant === "secondary") e.currentTarget.style.background = "var(--color-surface-hover)"
          else if (variant === "ghost") e.currentTarget.style.color = "var(--color-text)"
          else if (variant === "danger") e.currentTarget.style.background = "#dc2626"
        }
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") e.currentTarget.style.background = "var(--color-accent)"
        else if (variant === "secondary") e.currentTarget.style.background = "var(--color-surface)"
        else if (variant === "ghost") e.currentTarget.style.color = "var(--color-muted)"
        else if (variant === "danger") e.currentTarget.style.background = "var(--color-error)"
        onMouseLeave?.(e)
      }}
    >
      {loading ? <span className="cn-spinner" aria-hidden /> : iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  )
}
