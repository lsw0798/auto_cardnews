# 프론트엔드 구현 계획

## 라우팅 구조

```
app/
├── layout.tsx              # 네비게이션 + 글로벌 스타일
├── page.tsx                # / 홈 (키워드 입력 + 이력)
├── settings/
│   └── page.tsx            # /settings (API 키 관리)
└── pipeline/
    └── [jobId]/
        ├── page.tsx        # 파이프라인 현황 (SSE)
        ├── step/
        │   └── [stepId]/
        │       └── page.tsx # 단계별 상세
        └── result/
            └── page.tsx    # 완성 갤러리
```

## 상태 관리 전략

| 상태 | 저장소 | 이유 |
|------|-------|------|
| API 키 | localStorage | 재시작 후에도 유지 |
| 파이프라인 상태 | Zustand (pipelineStore) | SSE 이벤트로 갱신 |
| 완성된 카드뉴스 이력 | localStorage | 재시작 후에도 유지 |
| UI 상태 (모달, 편집) | 로컬 useState | 일회성 |

## 컴포넌트 계층

```
app/pipeline/[jobId]/page.tsx
├── PipelineTimeline
│   └── StepCard × 6
│       └── Badge (status)
├── AgentLogViewer (running 단계에 표시)
└── TemplateEditor (template done + image pending 시)
    └── [CardSlide 편집 폼] × 6

app/pipeline/[jobId]/result/page.tsx
└── CardNewsGallery
    └── CardSlidePreview × N
        └── ImageSlot (source 배지 포함)
```

## SSE 이벤트 처리 흐름

```
EventSource("/api/pipeline/[jobId]/stream")
  → step:start   → updateJob(stepId, status: "running")
  → step:done    → updateJob(stepId, { status: "done", output, durationMs })
  → step:error   → updateJob(stepId, { status: "error", error })
  → pipeline:complete → setJob(status: "completed")
  → pipeline:failed   → setJob(status: "failed")
```

## API 훅 목록

| 훅 | 역할 | 엔드포인트 |
|-----|-----|---------|
| `useStartPipeline` | 파이프라인 시작 | POST /api/pipeline |
| `usePipelineStream` | SSE 구독 | GET /api/pipeline/[jobId]/stream |
| `useSubmitSlides` | 편집 슬라이드 제출 | PATCH /api/pipeline/[jobId]/slides |
| `usePipelineState` | 현재 상태 조회 | GET /api/pipeline/[jobId] |
| `useTemplates` | 템플릿 목록 | GET /api/templates |
