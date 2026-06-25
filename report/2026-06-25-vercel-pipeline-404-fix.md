# Vercel Pipeline 404 오류 수정 보고서

작성일: 2026-06-25  
프로젝트: `auto_cardnews`  
배포 URL: `https://auto-cardnews-pearl.vercel.app/`

---

## 1. 문제

Vercel 배포 환경에서 카드뉴스 생성 중 간헐적으로 Pipeline API가 404를 반환했다.

주요 증상:

- 어떤 실행은 정상 작동
- 어떤 실행은 `Job not found` 404 발생
- 특히 `/api/pipeline/{jobId}/stream` 요청에서 문제 확인
- 동시 사용자 또는 여러 요청이 겹칠 때 발생 가능성 증가

---

## 2. 원인

원인은 Vercel 라우트 문제가 아니라 **파이프라인 상태 저장 방식 문제**였다.

기존 구조는 생성된 job 정보를 서버 메모리에만 저장했다.  
하지만 Vercel serverless 환경에서는 요청이 항상 같은 서버 인스턴스로 가지 않는다.

따라서 다음 상황이 발생할 수 있었다.

1. 파이프라인 시작 요청은 서버 A에서 처리됨
2. job 정보는 서버 A 메모리에만 저장됨
3. 이후 상태 조회 또는 stream 요청은 서버 B로 전달됨
4. 서버 B에는 job 정보가 없음
5. 결과적으로 404 발생

즉, 간헐적 404의 핵심 원인은 **in-memory 상태 저장소가 Vercel serverless 환경과 맞지 않았기 때문**이다.

---

## 3. 수정 내용

빠른 안정화를 위해 상태 저장 방식을 변경했다.

적용한 수정:

- 서버 메모리 기반 job 저장 제거
- Upstash Redis/KV 기반 job 저장 적용
- SSE 중심 구조를 polling 기반 상태 조회로 변경
- API route를 Vercel serverless 환경에 맞게 dynamic 처리
- 관련 lint 오류 정리

이제 파이프라인 job 상태는 외부 KV 저장소에 저장된다.  
따라서 요청이 어떤 Vercel 인스턴스로 가더라도 동일한 job 상태를 조회할 수 있다.

---

## 4. 환경변수

로컬과 Vercel Environment Variables에 KV 환경변수를 추가했다.

필수 환경변수:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

현재 로컬 및 Vercel 모두 설정 완료된 상태다.

---

## 5. 검증 결과

아래 검증을 완료했다.

- Upstash KV 연결 테스트 성공
- 임시 데이터 쓰기/읽기/삭제 성공
- `npm run lint` 성공
- `npm run build` 성공
- Next.js API route 빌드 포함 확인

검증 결과 요약:

| 항목 | 결과 |
|---|---|
| KV 환경변수 확인 | 성공 |
| Upstash 연결 테스트 | 성공 |
| Lint | 성공 |
| Build | 성공 |

---

## 6. 기대 효과

기존에는 job 상태가 특정 서버 메모리에만 있어 다른 서버에서 조회하면 404가 발생했다.

수정 후에는 job 상태가 Upstash KV에 저장되므로:

- 서버 인스턴스가 달라도 job 조회 가능
- 동시 사용자 실행 시 안정성 증가
- 간헐적 `Job not found` 404 감소 또는 해소 기대
- 결과 페이지 접근 안정성 개선

---

## 7. 배포 후 확인 항목

배포 후 아래 항목을 확인하면 된다.

1. 카드뉴스 생성 1회 실행
2. 다른 브라우저 또는 시크릿 창에서 동시에 실행
3. 파이프라인 상태가 계속 갱신되는지 확인
4. 완료 후 결과 페이지 접근 확인
5. DevTools Network에서 404 재발 여부 확인

---

## 8. 남은 개선 과제

이번 수정은 404 문제를 빠르게 안정화하기 위한 조치다.

장기적으로는 파이프라인 실행 자체를 API route 내부에서 처리하지 않고, 별도 queue 또는 background worker로 분리하는 것이 더 안정적이다.

후속 개선 후보:

- Upstash QStash
- Inngest
- Trigger.dev
- 별도 worker 서버
- Redis Pub/Sub 기반 실시간 업데이트

---

## 9. 현재 상태

현재 상태는 다음과 같다.

- 원인 분석 완료
- Upstash KV 기반 수정 완료
- 로컬 환경변수 설정 완료
- Vercel 환경변수 설정 완료
- lint/build 검증 완료
- 배포 후 실제 동시 실행 테스트 필요
