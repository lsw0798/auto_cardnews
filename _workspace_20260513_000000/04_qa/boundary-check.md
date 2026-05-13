# QA 경계면 검증 보고서

## 발견된 이슈 목록

| ID | 심각도 | 위치 | 설명 | 권고 조치 |
|----|--------|------|------|---------|
| W-01 | HIGH | `hooks/usePipelineStream.ts:178` | `pipeline:failed` 처리 시 `currentStep = null` 누락 | `next.currentStep = null` 추가 |
| W-02 | HIGH | `hooks/usePipelineStream.ts` | 종료 이벤트 수신 후 `EventSource.close()` 미호출 → 브라우저 반복 재연결 | 종료 이벤트 처리 후 `es.close()` 호출 |
| W-03 | MEDIUM | `lib/pipeline/runner.ts` | `templateId` 하드코딩 — 홈 페이지 템플릿 선택이 파이프라인에 미적용 | `startPipeline`에 `templateId` 파라미터 추가 |
| W-04 | MEDIUM | `app/api/pipeline/[jobId]/slides/route.ts` | `CardSlide[]` 요소 런타임 검증 없음 | 각 요소 필수 필드 검증 |
| W-05 | MEDIUM | `app/api/pipeline/route.ts` | `ApiKeys` 런타임 필드 검증 부재 | `openaiKey`, `serperKey` 존재 여부 파싱 직후 검증 |
| W-06 | MEDIUM | `app/page.tsx` | history 링크에 `item.id`(CardNews ID) 사용 → jobId와 다르면 404 | history에 `jobId` 함께 저장 |
| W-07 | MEDIUM | `lib/agents/image-agent.ts` | `step:error` payload 형식 불일치 → `step.error` store 미반영 | payload를 `{ error: { code, message, retryable } }` 로 통일 |

## 종합 평가

| 심각도 | 건수 |
|--------|------|
| CRITICAL | 0 |
| HIGH | 2 (W-01, W-02) — 즉시 수정됨 |
| MEDIUM | 5 — 즉시 수정됨 |

**Verdict: PASS (수정 후) — 빌드 성공, CRITICAL 이슈 없음.**
