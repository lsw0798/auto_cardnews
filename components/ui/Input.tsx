"use client"

import type { InputHTMLAttributes, ReactNode } from "react"
import { useId } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  trailing?: ReactNode
}

export function Input({ label, hint, error, trailing, id, style, ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text)",
            letterSpacing: "-0.005em",
          }}
        >
          {label}
        </label>
      ) : null}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          id={inputId}
          {...rest}
          className={`cn-focus-ring ${rest.className ?? ""}`}
          style={{
            width: "100%",
            height: 42,
            padding: trailing ? "0 44px 0 14px" : "0 14px",
            background: "var(--color-bg-soft)",
            border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
            borderRadius: 10,
            color: "var(--color-text)",
            fontSize: 14,
            outline: "none",
            transition: "border-color 160ms ease, background 160ms ease",
            ...style,
          }}
        />
        {trailing ? (
          <div
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? (
        <span style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{hint}</span>
      ) : null}
    </div>
  )
}
