---
name: backend-api
description: "백엔드 API 설계, DB 스키마 모델링, 인증 설계, 환경 변수 목록 작성. Next.js API Routes 또는 Node.js 서버의 백엔드 설계 시 반드시 사용. API 계약 문서 작성 요청 시 항상 트리거."
---

# Backend API Skill

웹 애플리케이션 백엔드 설계 산출물을 체계적으로 작성하는 스킬. API 계약서부터 DB 스키마까지 프론트엔드 팀이 구현에 착수할 수 있는 수준의 문서를 만든다.

## 산출물 1: API 스펙 (api-spec.md)

엔드포인트별 request/response를 명확히 정의. 프론트엔드 훅 타입의 기준이 된다.

```markdown
## 공통 응답 형식
```json
// 성공
{ "success": true, "data": {...}, "error": null }

// 실패
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "리소스를 찾을 수 없습니다" } }
```

## 엔드포인트 목록

### GET /api/projects
**설명**: 프로젝트 목록 조회
**인증**: 필요 (Bearer JWT)
**쿼리**: `?page=1&limit=20`

**응답 (200)**:
```json
{
  "success": true,
  "data": {
    "projects": [
      { "id": "uuid", "title": "string", "createdAt": "ISO8601" }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  },
  "error": null
}
```

### POST /api/projects
**설명**: 프로젝트 생성
**인증**: 필요
**Body**:
```json
{ "title": "string (required)", "description": "string (optional)" }
```
**응답 (201)**:
```json
{ "success": true, "data": { "project": {...} }, "error": null }
```
```

## 산출물 2: DB 스키마 (db-schema.md)

Prisma 스키마 형태로 작성. 관계, 인덱스, 제약 조건 포함.

```markdown
## Prisma Schema
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```
```

## 산출물 3: 인증 설계 (auth-design.md)

인증 방식과 권한 레벨을 명시.

```markdown
## 인증 방식
- **방식**: NextAuth.js (세션 기반) 또는 JWT (Stateless)
- **프로바이더**: Email/Password, Google OAuth

## 권한 레벨
| 레벨 | 설명 | 접근 가능 경로 |
|------|------|--------------|
| 비인증 | 미로그인 | /, /login, /signup |
| 인증   | 로그인 | /dashboard/*, /api/* |
| 관리자 | admin 역할 | /admin/* |

## 미들웨어 보호
```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/api/projects/:path*']
}
```
```

## 산출물 4: 환경 변수 목록 (env-vars.md)

배포 시 필요한 모든 환경 변수를 정리.

```markdown
## .env.example
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
```

## 설계 원칙

### 페이지네이션
모든 목록 API는 `page` + `limit`으로 페이지네이션. `total` 포함하여 프론트가 전체 페이지 수 계산 가능.

### 에러 코드 표준
| 코드 | HTTP | 의미 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

### N+1 방지
관계 데이터는 Prisma `include`로 한 번에 조회. 루프 안에서 추가 쿼리 금지.

## frontend-dev와 API 계약 합의 절차

1. api-spec.md 초안 작성 → SendMessage로 frontend-dev에게 전달
2. frontend-dev의 shape 조정 요청 수신
3. Breaking change 여부 판단:
   - Non-breaking (필드 추가): 즉시 반영
   - Breaking (필드 제거/이름 변경): 이유 설명 후 합의
4. 확정된 스펙을 파일에 반영하고 TaskUpdate
