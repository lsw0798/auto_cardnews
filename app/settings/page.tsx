import { ApiKeyForm } from "@/components/settings/ApiKeyForm"

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>API 키 설정</h1>
      <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 36 }}>
        카드뉴스 생성에 필요한 외부 API 키를 입력하세요. 키는 브라우저 localStorage에만 저장되며 서버로 전송되지 않습니다.
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <ApiKeyForm />
      </div>

      <div style={{ marginTop: 24, padding: 16, background: "var(--color-warning-soft)", borderRadius: "var(--radius-md)", border: "1px solid rgba(245,158,11,0.3)" }}>
        <p style={{ fontSize: 13, color: "var(--color-warning)", margin: 0, fontWeight: 500 }}>
          💡 Unsplash 키를 비워두면 DALL-E로 이미지를 생성합니다. DALL-E 생성도 실패하면 placeholder 이미지를 사용합니다.
        </p>
      </div>
    </div>
  )
}
