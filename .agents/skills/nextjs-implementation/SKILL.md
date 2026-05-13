---
name: nextjs-implementation
description: "Next.js App Router 기반 프론트엔드 구현. 컴포넌트 계층 설계, API 훅 타입 정의, 라우팅 구조 설계, 상태 관리 전략. 프론트엔드 구현 계획 작성 시 반드시 사용."
---

# Next.js Implementation Skill

React/Next.js 프론트엔드 구현 계획을 체계적으로 작성하는 스킬. 설계 산출물을 코드 구조로 변환한다.

## 산출물 1: 라우팅 구조 (page-structure.md)

Next.js App Router 파일 구조로 변환.

```markdown
## 디렉토리 구조 (app/)
app/
├── layout.tsx            # 루트 레이아웃 (폰트, 글로벌 CSS)
├── page.tsx              # 홈 (/)
├── (auth)/
│   ├── login/page.tsx    # /login
│   └── signup/page.tsx   # /signup
├── dashboard/
│   ├── layout.tsx        # 대시보드 공통 레이아웃
│   └── page.tsx          # /dashboard
└── api/                  # API Routes (백엔드 담당)

## 컴포넌트 디렉토리
components/
├── ui/                   # 원자 컴포넌트
│   ├── Button.tsx
│   └── Input.tsx
├── layout/               # 레이아웃 컴포넌트
│   ├── Header.tsx
│   └── Footer.tsx
└── {feature}/            # 기능별 복합 컴포넌트
```

## 산출물 2: API 훅 목록 (api-hooks.md)

백엔드 API 스펙과 1:1로 매핑. 타입 불일치 방지를 위해 API 응답 shape을 훅 타입과 나란히 기술.

```markdown
## 훅 목록
| 훅 | 엔드포인트 | API 응답 Shape | 훅 반환 타입 | 메서드 |
|----|-----------|---------------|-------------|--------|
| useProjects | GET /api/projects | `{ projects: Project[], total: number }` | `{ projects: Project[], total: number }` | GET |
| useCreateProject | POST /api/projects | `{ project: Project }` | `{ project: Project }` | POST |

## 타입 정의 (types/api.ts)
```typescript
export interface Project {
  id: string
  title: string
  createdAt: string  // ISO 8601
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}
```

## API 훅 구현 패턴 (TanStack Query)
```typescript
// hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<{ projects: Project[]; total: number }> => {
      const res = await fetch('/api/projects')
      const json: ApiResponse<{ projects: Project[]; total: number }> = await res.json()
      if (!json.success) throw new Error(json.error?.message)
      return json.data!
    },
  })
}
```

## 산출물 3: 컴포넌트 계층 구조 (component-tree.md)

와이어프레임의 컴포넌트를 계층으로 표현.

```markdown
## 홈 페이지 계층
HomePage
├── Header (layout/Header.tsx)
│   ├── Logo
│   ├── NavLinks
│   └── Button (ui/Button.tsx) — "시작하기"
├── HeroSection (home/HeroSection.tsx)
│   ├── HeroTitle
│   └── Button (ui/Button.tsx) — "무료로 시작"
└── FeaturesSection (home/FeaturesSection.tsx)
    └── FeatureCard[] (home/FeatureCard.tsx)
```

## 산출물 4: 구현 계획 (implementation-plan.md)

구현 순서와 의존성. 의존성 없는 작업은 병렬 구현 가능.

```markdown
## 1단계 (병렬 가능)
- [ ] 디자인 토큰 → globals.css 적용
- [ ] 원자 컴포넌트 (Button, Input) 구현
- [ ] API 타입 정의 (types/api.ts)

## 2단계 (1단계 완료 후)
- [ ] 레이아웃 컴포넌트 (Header, Footer)
- [ ] API 훅 구현

## 3단계 (2단계 완료 후)
- [ ] 페이지별 복합 컴포넌트 구현
- [ ] 페이지 라우팅 연결
```

## 핵심 패턴

### 서버 컴포넌트 vs 클라이언트 컴포넌트

인터랙션이나 훅이 필요하면 `'use client'` 추가. 그 외는 서버 컴포넌트 기본값.

### 에러/로딩 상태

```typescript
const { data, isLoading, error } = useProjects()
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage message={error.message} />
```

### 환경 변수

- 브라우저 노출: `NEXT_PUBLIC_` 접두사
- 서버 전용: 접두사 없이 (API Routes에서만 사용)
