---
name: web-qa
description: "웹사이트 QA 테스트 계획 수립, API↔프론트 경계면 정합성 교차 검증, 단위/통합/E2E 테스트 시나리오 작성. 구현 완료 후 QA 단계에서 반드시 사용. 테스트 계획이나 버그 검증 요청 시 항상 트리거."
---

# Web QA Skill

웹 애플리케이션의 통합 정합성을 검증하는 스킬. 개별 컴포넌트의 정확성보다 경계면 교차 검증에 집중한다.

## 핵심 원칙: 경계면 교차 검증

"빌드 통과 ≠ 정상 동작". TypeScript 제네릭, `as` 타입 단언, `any`는 컴파일러가 런타임 불일치를 감지하지 못하게 한다. API 응답 shape과 프론트 훅 타입을 직접 비교한다.

## 검증 1: API ↔ 프론트 경계면

API 스펙과 프론트 훅을 1:1 매핑 테이블로 작성.

```markdown
## API ↔ 훅 매핑 검증 (boundary-check.md)

| API 엔드포인트 | API 응답 Shape | 프론트 훅 | 훅 타입 파라미터 | 일치 여부 | 이슈 |
|--------------|--------------|---------|----------------|----------|------|
| GET /api/projects | `{ projects: Project[], total: number }` | useProjects | `{ projects: Project[], total: number }` | ✅ | - |
| POST /api/auth/login | `{ token: string }` | useLogin | `User` | ❌ CRITICAL | shape 불일치: API는 token 반환, 훅은 User 기대 |

## 래핑 패턴 확인
- API가 `{ data: [...] }` 래핑 → 훅이 `.data` 언래핑하는지 확인
- API가 배열 직접 반환 → 훅이 배열 타입인지 확인
```

## 검증 2: 라우팅 정합성

```markdown
## 페이지 경로 ↔ 링크 href 매핑

| 실제 페이지 파일 | 경로 | 링크 href 사용처 | 일치 여부 |
|----------------|------|----------------|----------|
| app/dashboard/page.tsx | /dashboard | Header.tsx L23 | ✅ |
| app/dashboard/create/page.tsx | /dashboard/create | - | ❌ MEDIUM: href 없음 (미연결) |
```

## 검증 3: 타입 위험 지점

```markdown
## `any` / 타입 단언 사용 목록

| 파일 | 위치 | 코드 | 위험도 | 검증 필요 |
|------|------|------|--------|---------|
| hooks/useAuth.ts | L45 | `data as User` | HIGH | 실제 응답이 User shape인지 확인 |
```

## 테스트 계획 (test-plan.md)

### 단위 테스트 (Jest/Vitest)
```markdown
## 테스트 대상 및 시나리오

### Button 컴포넌트
- [ ] 클릭 시 onClick 호출
- [ ] disabled=true 시 클릭 비활성
- [ ] variant별 CSS 클래스 적용

### useProjects 훅
- [ ] 성공 시 projects 배열 반환
- [ ] API 에러 시 error 상태 설정
- [ ] loading 상태 초기값 true
```

### 통합 테스트 (API Routes)
```markdown
### GET /api/projects
- [ ] 인증 없으면 401 반환
- [ ] 정상 요청 시 { success: true, data: { projects, total } } 반환
- [ ] page/limit 파라미터 동작 확인

### POST /api/projects
- [ ] title 없으면 400 + VALIDATION_ERROR 반환
- [ ] 성공 시 201 + 생성된 project 반환
```

### E2E 테스트 (Playwright)
```markdown
### 핵심 흐름
1. 회원가입 → 이메일 인증 → 로그인 → 대시보드 진입
2. 프로젝트 생성 → 목록에 표시 → 상세 페이지 이동
3. 로그아웃 → 보호 경로 접근 시 로그인 페이지 리다이렉트

### 시나리오 예시
```typescript
test('프로젝트 생성 흐름', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('[type=submit]')
  await expect(page).toHaveURL('/dashboard')
  await page.click('text=새 프로젝트')
  await page.fill('[name=title]', '테스트 프로젝트')
  await page.click('[type=submit]')
  await expect(page.locator('text=테스트 프로젝트')).toBeVisible()
})
```

## 이슈 기록 형식 (issues.md)

```markdown
## 발견 이슈 목록

### [CRITICAL-001] API 응답 shape ↔ 훅 타입 불일치
- **위치**: GET /api/auth/me ↔ hooks/useAuth.ts
- **API 응답**: `{ user: { id, email, name } }`
- **훅 타입**: `User` (래핑 없이 User 직접 기대)
- **영향**: 로그인 후 사용자 정보 미표시
- **권고**: 훅에서 `response.data.user` 추출하도록 수정

### [HIGH-001] 미연결 라우트
- **위치**: app/settings/page.tsx
- **문제**: 경로 /settings 존재하지만 nav에 링크 없음
- **권고**: Header에 설정 링크 추가 또는 페이지 제거
```

## 커버리지 목표

| 레이어 | 최소 커버리지 |
|--------|-------------|
| 유틸리티 함수 | 90% |
| API 훅 | 80% |
| 핵심 컴포넌트 | 70% |
| E2E 핵심 흐름 | 100% (3개 이상) |
