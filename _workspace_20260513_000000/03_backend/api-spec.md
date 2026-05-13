# API 스펙

## 공통 응답 Envelope

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}
```

## 엔드포인트 목록

### POST /api/pipeline
파이프라인 시작

**Headers:**
- `x-api-keys`: base64(JSON.stringify(ApiKeys))
- `Content-Type`: application/json

**Body:**
```json
{ "keyword": "string", "templateId": "string?" }
```

**Response:** `ApiResponse<{ jobId: string; state: PipelineState }>`

**동작:**
1. 헤더에서 ApiKeys 파싱
2. nanoid로 jobId 생성
3. jobStore에 초기 상태 저장
4. 백그라운드에서 파이프라인 시작 (await 없이)
5. 즉시 jobId + 초기 state 반환

---

### GET /api/pipeline/[jobId]
파이프라인 현재 상태 조회

**Response:** `ApiResponse<PipelineState>`

---

### GET /api/pipeline/[jobId]/stream
SSE 스트림

**Response:** `text/event-stream`

**이벤트 형식:**
```
data: {"type":"step:start","jobId":"...","stepId":"search","payload":{},"timestamp":"..."}

data: {"type":"step:done","jobId":"...","stepId":"search","payload":{"totalCount":15},"timestamp":"..."}

data: {"type":"pipeline:complete","jobId":"...","payload":{"cardNewsId":"..."},"timestamp":"..."}
```

**이벤트 타입:**
| 타입 | 발생 시점 | payload |
|------|---------|---------|
| `step:start` | 각 단계 시작 | `{}` |
| `step:progress` | 단계 중간 | 진행 메시지 |
| `step:done` | 단계 완료 | 단계 출력 요약 |
| `step:error` | 단계 에러 | 에러 정보 |
| `pipeline:complete` | 전체 완료 | `{ cardNewsId }` |
| `pipeline:failed` | 전체 실패 | 에러 정보 |

---

### PATCH /api/pipeline/[jobId]/slides
Step 4 완료 후 사용자 편집 슬라이드 제출

**Body:**
```json
{ "slides": CardSlide[] }
```

**Response:** `ApiResponse<{ ok: boolean }>`

**동작:**
1. jobStore의 template output slides 업데이트
2. runner에게 Step 5(image) 계속 실행 신호

---

### GET /api/templates
사용 가능한 템플릿 목록

**Response:** `ApiResponse<CardTemplate[]>`
