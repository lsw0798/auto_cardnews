import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "CardNews Generator",
  description: "키워드로 카드뉴스를 자동 생성합니다",
}

function ApiStatus() {
  const openai = !!process.env.OPENAI_API_KEY
  const serper = !!process.env.SERPER_API_KEY
  const model = process.env.LLM_MODEL ?? "gpt-4o"
  const allOk = openai && serper

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${allOk ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        background: allOk ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
        color: allOk ? "#4ade80" : "#f87171",
      }}
      title={`OpenAI: ${openai ? "✓" : "✗"}  Serper: ${serper ? "✓" : "✗"}  Model: ${model}`}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: allOk ? "#4ade80" : "#f87171",
          boxShadow: allOk ? "0 0 6px #4ade80" : "0 0 6px #f87171",
          flexShrink: 0,
        }}
      />
      {allOk ? `API 연결됨 · ${model}` : "API 키 없음"}
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <header
          style={{
            borderBottom: "1px solid var(--color-border-soft)",
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(15,23,42,0.65))",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <nav
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: "-0.01em",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "white",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                }}
              >
                ◆
              </span>
              <span>
                CardNews
                <span style={{ color: "var(--color-muted)", fontWeight: 500 }}>
                  {" "}
                  / generator
                </span>
              </span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
              <ApiStatus />
              <Link
                href="/"
                style={{ padding: "8px 12px", borderRadius: 8, color: "var(--color-muted)" }}
                className="cn-focus-ring"
              >
                홈
              </Link>
              <Link
                href="/settings"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                }}
                className="cn-focus-ring"
              >
                설정
              </Link>
            </div>
          </nav>
        </header>
        <main style={{ flex: 1, width: "100%" }}>{children}</main>
        <footer
          style={{
            padding: "32px 24px",
            textAlign: "center",
            color: "var(--color-faint)",
            fontSize: 13,
            borderTop: "1px solid var(--color-border-soft)",
          }}
        >
          5단계 에이전트 파이프라인 · 검색 → 정제 → 템플릿 → 이미지 → 조립
        </footer>
      </body>
    </html>
  )
}
