"use client"

import { useState } from "react"
import { useApiKeys } from "@/hooks/useApiKeys"
import type { ApiKeys } from "@/types"

const FIELDS: { key: keyof ApiKeys; label: string; placeholder: string; isPassword: boolean }[] = [
  { key: "openaiKey", label: "OpenAI API Key", placeholder: "sk-...", isPassword: true },
  { key: "serperKey", label: "Serper API Key", placeholder: "API 키 입력", isPassword: true },
  { key: "unsplashKey", label: "Unsplash Access Key", placeholder: "API 키 입력", isPassword: true },
  { key: "llmBaseUrl", label: "LLM Base URL (선택)", placeholder: "https://api.openai.com/v1", isPassword: false },
  { key: "llmModel", label: "LLM Model (선택)", placeholder: "gpt-4o", isPassword: false },
]

export function ApiKeyForm() {
  const { apiKeys, saveApiKeys } = useApiKeys()
  const [form, setForm] = useState<ApiKeys>(apiKeys)
  const [visible, setVisible] = useState<Partial<Record<keyof ApiKeys, boolean>>>({})
  const [saved, setSaved] = useState(false)

  function handleChange(key: keyof ApiKeys, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveApiKeys(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {FIELDS.map(({ key, label, placeholder, isPassword }) => (
        <div key={key}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-muted)", marginBottom: 6 }}>
            {label}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={isPassword && !visible[key] ? "password" : "text"}
              value={(form[key] as string) ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              style={{ ...inputStyle, paddingRight: isPassword ? 44 : 14 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 2,
                }}
                aria-label={visible[key] ? "숨기기" : "보이기"}
              >
                {visible[key] ? "🙈" : "👁"}
              </button>
            )}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <button
          type="submit"
          style={{
            padding: "10px 24px",
            background: "var(--color-accent)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-accent)")}
        >
          저장
        </button>
        {saved && (
          <span className="cn-fade-in" style={{ color: "var(--color-success)", fontSize: 14, fontWeight: 600 }}>
            ✓ 저장되었습니다
          </span>
        )}
      </div>
    </form>
  )
}
