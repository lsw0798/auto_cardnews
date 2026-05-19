# 카드뉴스 자동 생성기

키워드 하나로 AI가 자동으로 카드뉴스를 만들어주는 웹 앱입니다.  
5단계 에이전트 파이프라인이 웹 검색 → 내용 정리 → 템플릿 구성 → 이미지 처리 → 결과 조합까지 자동으로 처리합니다.

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정 (`.env.local` 만들기)

프로젝트 루트에 `.env.local` 파일을 새로 만들고 아래 내용을 붙여넣으세요.

```bash
# OpenAI (LLM 카드뉴스 생성 + DALL-E 이미지) — 필수
OPENAI_API_KEY="sk-..."

# Serper (웹/뉴스 검색) — 필수
SERPER_API_KEY="..."

# Unsplash (이미지 검색) — 선택
UNSPLASH_ACCESS_KEY="..."

# OpenAI 호환 커스텀 엔드포인트 — 선택 (기본: OpenAI)
LLM_BASE_URL=

# 사용할 모델명 — 선택 (기본: gpt-4o)
LLM_MODEL=gpt-4o-mini
```

> **참고:** `OPENAI_API_KEY`와 `SERPER_API_KEY`는 필수입니다.  
> `UNSPLASH_ACCESS_KEY`가 없으면 이미지 검색 실패 시 DALL-E로 자동 대체됩니다.

키를 변경한 뒤에는 **서버를 재시작**해야 반영됩니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

---

## 예시 슬라이드 추가하기

`lib/examples/example-feeds.ts` 파일에서 예시 카드뉴스 데이터를 관리합니다.

```
lib/
└── examples/
    └── example-feeds.ts   ← 여기에 예시 프롬프트/슬라이드 추가
```

새 예시를 추가하려면 `EXAMPLE_FEEDS` 배열에 항목을 추가하세요:

```ts
export const EXAMPLE_FEEDS: ExampleFeed[] = [
  {
    keyword: "키워드",
    slides: [
      {
        slideIndex: 1,
        slotType: "title",   // "title" | "content" | "outro"
        title: "슬라이드 제목",
        body: "",
      },
      {
        slideIndex: 2,
        slotType: "content",
        title: "내용 제목",
        subtext: "소제목",
        body: "본문 내용",
      },
      // ...
    ],
  },
  // 추가 예시...
]
```

### `slotType` 종류

| 값 | 용도 |
|----|------|
| `title` | 표지 슬라이드 (제목만) |
| `content` | 본문 슬라이드 (제목 + 소제목 + 본문) |
| `outro` | 마무리 슬라이드 |

---

## API 키 확인

실행 중 브라우저에서 **설정** 페이지(`/settings`)를 열면 현재 서버에 설정된 환경 변수 목록을 확인할 수 있습니다.

---

## 프로젝트 구조

```
myproject/
├── app/
│   ├── api/pipeline/       # 파이프라인 API (시작, 상태, SSE 스트림)
│   ├── api/templates/      # 템플릿 목록 API
│   ├── pipeline/[jobId]/   # 파이프라인 진행 화면
│   └── settings/           # API 키 설정 안내 페이지
├── components/
│   ├── card-news/          # 카드뉴스 갤러리 · 슬라이드 · 이미지 컴포넌트
│   ├── pipeline/           # 파이프라인 타임라인 · 로그 뷰어
│   └── ui/                 # 공통 UI 컴포넌트
├── lib/
│   ├── agents/             # 에이전트 로직 (검색, 큐레이션, 템플릿, 이미지, 조합)
│   ├── config/             # 환경 변수 로더 및 유효성 검사
│   ├── examples/           # 예시 카드뉴스 데이터 ← 예시 추가 위치
│   ├── external/           # 외부 API 클라이언트 (OpenAI, Serper, Unsplash)
│   ├── pipeline/           # 파이프라인 실행 엔진 · 상태 관리
│   └── templates/          # 기본 카드뉴스 템플릿
├── stores/                 # Zustand 전역 상태
├── types/                  # 공통 TypeScript 타입
└── .env.local              # 환경 변수 (직접 생성 필요, git 제외)
```

---

## 파이프라인 단계

| 단계 | 에이전트 | 역할 |
|------|----------|------|
| 1 | search-agent | 키워드로 웹/뉴스 검색 |
| 2 | curate-agent | 검색 결과에서 핵심 내용 정리 |
| 3 | template-agent | `lib/examples/example-feeds.ts`의 예시를 few-shot으로 참조해 LLM이 `title / content / outro` 슬롯 구조의 슬라이드를 생성 |
| 4 | image-agent | 슬라이드별 이미지 검색 / DALL-E 생성 |
| 5 | assemble-agent | 최종 카드뉴스 조합 |

각 단계의 진행 상황은 `/pipeline/[jobId]` 페이지에서 실시간으로 확인할 수 있습니다.

---

## 빌드

```bash
npm run build
npm run start
```
