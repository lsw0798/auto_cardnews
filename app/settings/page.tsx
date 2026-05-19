export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>API 키 설정</h1>
      <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 36 }}>
        API 키는 서버의 환경변수(.env.local)에서 읽습니다.
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {[
          { key: "OPENAI_API_KEY", desc: "LLM 카드뉴스 생성 + DALL-E 이미지 (필수)" },
          { key: "SERPER_API_KEY", desc: "웹/뉴스 검색 (필수)" },
          { key: "UNSPLASH_ACCESS_KEY", desc: "Unsplash 이미지 검색 (선택)" },
          { key: "LLM_BASE_URL", desc: "OpenAI 호환 커스텀 엔드포인트 (선택)" },
          { key: "LLM_MODEL", desc: "사용할 모델명, 기본값 gpt-4o (선택)" },
        ].map(({ key, desc }) => (
          <div key={key}>
            <code style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)" }}>{key}</code>
            <p style={{ fontSize: 13, color: "var(--color-muted)", margin: "4px 0 0" }}>{desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: "var(--color-warning-soft)", borderRadius: "var(--radius-md)", border: "1px solid rgba(245,158,11,0.3)" }}>
        <p style={{ fontSize: 13, color: "var(--color-warning)", margin: 0, fontWeight: 500 }}>
          키를 변경하려면 프로젝트 루트의 .env.local 파일을 수정한 뒤 서버를 재시작하세요.
        </p>
      </div>
    </div>
  )
}
