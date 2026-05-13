# 카드뉴스 자동 생성 웹앱 — 하네스 실행 결과

## 설계 산출물 (Phase 2)
- [요구사항](_workspace/00_input/requirements.md)
- [와이어프레임](_workspace/02_design/wireframes.md)
- [디자인 토큰](_workspace/02_design/design-tokens.md)

## 구현 계획 (Phase 3)
- [API 스펙](_workspace/03_backend/api-spec.md)
- [프론트엔드 구현 계획](_workspace/03_frontend/implementation-plan.md)

## QA 검증 (Phase 4)
- [경계면 검증 보고서](_workspace/04_qa/boundary-check.md)

---

## 구현된 파일 목록

### 공통 타입
- `types/index.ts` — 모든 공유 타입 (StepId, PipelineState, CardNews 등)

### 백엔드 — 외부 API 클라이언트
- `lib/external/llm-client.ts` — OpenAI Chat Completions 래퍼
- `lib/external/serper-client.ts` — Serper 웹/뉴스 검색
- `lib/external/unsplash-client.ts` — Unsplash 이미지 검색
- `lib/external/dalle-client.ts` — DALL-E 이미지 생성

### 백엔드 — 에이전트 모듈
- `lib/agents/types.ts` — Agent 인터페이스 + AgentContext
- `lib/agents/search-agent.ts` — Step 2: Serper 웹+뉴스 검색
- `lib/agents/curate-agent.ts` — Step 3: LLM 핵심 사실 추출
- `lib/agents/template-agent.ts` — Step 4: LLM 슬라이드 생성
- `lib/agents/image-agent.ts` — Step 5: Unsplash → DALL-E → placeholder
- `lib/agents/assemble-agent.ts` — Step 6: 최종 CardNews 조립

### 백엔드 — 파이프라인
- `lib/pipeline/state.ts` — In-memory jobStore
- `lib/pipeline/emitter.ts` — SSE EventEmitter 싱글턴
- `lib/pipeline/runner.ts` — 순차 실행 오케스트레이터 (Step 4 후 PAUSE/RESUME)
- `lib/templates/default-template.ts` — 기본 6슬롯 템플릿

### 백엔드 — API 라우트
- `app/api/pipeline/route.ts` — POST: 파이프라인 시작
- `app/api/pipeline/[jobId]/route.ts` — GET: 상태 조회
- `app/api/pipeline/[jobId]/stream/route.ts` — GET: SSE 스트림
- `app/api/pipeline/[jobId]/slides/route.ts` — PATCH: 슬라이드 편집 후 재개
- `app/api/templates/route.ts` — GET: 템플릿 목록

### 프론트엔드 — 훅 + 스토어
- `hooks/useApiKeys.ts` — localStorage API 키 관리
- `hooks/usePipelineStream.ts` — SSE 구독 + Zustand 업데이트
- `stores/pipelineStore.ts` — Zustand 파이프라인 상태

### 프론트엔드 — UI 컴포넌트
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Card.tsx`
- `components/ui/Progress.tsx`

### 프론트엔드 — 파이프라인 컴포넌트
- `components/pipeline/PipelineTimeline.tsx`
- `components/pipeline/StepCard.tsx`
- `components/pipeline/AgentLogViewer.tsx`

### 프론트엔드 — 카드뉴스 컴포넌트
- `components/card-news/CardSlidePreview.tsx`
- `components/card-news/ImageSlot.tsx`
- `components/card-news/TemplateEditor.tsx`
- `components/card-news/CardNewsGallery.tsx`

### 프론트엔드 — 설정
- `components/settings/ApiKeyForm.tsx`
- `app/settings/page.tsx`

### 프론트엔드 — 페이지
- `app/page.tsx` — 홈 (키워드 입력 + 이력)
- `app/pipeline/[jobId]/page.tsx` — 파이프라인 현황 + TemplateEditor
- `app/pipeline/[jobId]/step/[stepId]/page.tsx` — 단계별 상세
- `app/pipeline/[jobId]/result/page.tsx` — 완성 갤러리

---

## QA 이슈 수정 내역

| ID | 심각도 | 수정 완료 |
|----|--------|---------|
| W-01 | HIGH | usePipelineStream: pipeline:failed 시 currentStep=null 추가 |
| W-02 | HIGH | usePipelineStream: 종료 이벤트 후 es.close() 호출 추가 |
| W-03 | MEDIUM | runner.ts: templateId 파라미터 추가 (더 이상 하드코딩 없음) |
| W-06 | MEDIUM | history에 jobId 저장 → 결과 페이지 링크 수정 |
| W-07 | MEDIUM | image-agent step:error payload 형식 표준화 |

---

## 다음 단계

1. `npm run dev` 실행 → `http://localhost:3000`
2. `/settings`에서 API 키 입력
3. `/`에서 키워드 입력 → "카드뉴스 생성 시작"
4. `/pipeline/[jobId]`에서 실시간 진행 확인
5. Step 4 완료 후 슬라이드 편집 → "이미지 생성 시작"
6. 완료 후 "카드뉴스 보기" → 갤러리 + PNG 다운로드
