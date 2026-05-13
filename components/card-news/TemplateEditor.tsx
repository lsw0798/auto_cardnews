"use client"

import { useState } from "react"
import type { CardSlide } from "@/types"

interface TemplateEditorProps {
  slides: CardSlide[]
  jobId: string
  onSubmit: (slides: CardSlide[]) => Promise<void>
}

export function TemplateEditor({ slides: initialSlides, jobId, onSubmit }: TemplateEditorProps) {
  const [slides, setSlides] = useState<CardSlide[]>(initialSlides)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateSlide(index: number, field: keyof CardSlide, value: string) {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(slides)
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출 실패")
      setSubmitting(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-muted)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 4,
    display: "block",
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--color-text)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-faint)" }}>#{index + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase" }}>{slide.slotType}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>제목</label>
                <input
                  style={inputStyle}
                  value={slide.title}
                  onChange={(e) => updateSlide(index, "title", e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
              </div>
              <div>
                <label style={labelStyle}>본문</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 72 }}
                  value={slide.body}
                  onChange={(e) => updateSlide(index, "body", e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
              </div>
              {(slide.subtext !== undefined || slide.slotType === "outro") && (
                <div>
                  <label style={labelStyle}>보조 텍스트 (선택)</label>
                  <input
                    style={inputStyle}
                    value={slide.subtext ?? ""}
                    onChange={(e) => updateSlide(index, "subtext", e.target.value)}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--color-error-soft)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "14px",
          background: submitting ? "var(--color-border)" : "var(--color-accent)",
          border: "none",
          borderRadius: "var(--radius-md)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          cursor: submitting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 150ms",
        }}
      >
        {submitting ? (
          <>
            <span className="cn-spinner" />
            이미지 생성 중...
          </>
        ) : (
          "▶ 이미지 생성 시작"
        )}
      </button>
    </div>
  )
}
