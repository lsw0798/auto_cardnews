---
name: web-dev-orchestrator
description: "웹사이트 개발 팀 전체를 와이어프레임부터 배포까지 조율하는 오케스트레이터. 웹사이트 만들어줘, 웹 개발, 디자인부터 배포, Next.js 프로젝트 시작, 랜딩 페이지 만들어줘 요청 시 반드시 이 스킬을 사용. 후속 작업: 디자인 수정, API 다시 설계, QA 재실행, 배포 설정 업데이트, 이전 결과 개선, 다시 실행, 보완, 부분 재실행 요청 시에도 반드시 트리거."
---

# Web Development Orchestrator

디자인 → 구현 → QA → 배포의 완전한 파이프라인을 조율하는 통합 스킬.

## 실행 모드: 하이브리드

| Phase | 모드 | 팀/에이전트 | 이유 |
|-------|------|-----------|------|
| Phase 2 (설계) | 에이전트 팀 | designer + frontend-dev | 와이어프레임↔구현 피드백 교환 필수 |
| Phase 3 (구현) | 에이전트 팀 | frontend-dev + backend-dev | API 계약 합의, shape 교차 검증 필수 |
| Phase 4 (QA) | 서브 에이전트 | qa-engineer | 독립 검증, 팀 통신 불필요 |
| Phase 5 (배포) | 서브 에이전트 | devops | 단독 실행, 의존성 없음 |

## 에이전트 구성

| 에이전트 | 타입 | Phase | 스킬 | 주요 산출물 |
|---------|------|-------|------|-----------|
| designer | 커스텀 | 2 | design-system | wireframes.md, components.md, design-tokens.md |
| frontend-dev | 커스텀 | 2, 3 | nextjs-implementation | component-tree.md, api-hooks.md, page-structure.md |
| backend-dev | 커스텀 | 3 | backend-api | api-spec.md, db-schema.md, auth-design.md |
| qa-engineer | 커스텀 | 4 | web-qa | boundary-check.md, test-plan.md, issues.md |
| devops | 커스텀 | 5 | (인라인) | ci-cd.md, deployment-guide.md |

---

## 워크플로우

### Phase 0: 컨텍스트 확인 (후속 작업 지원)

`_workspace/` 디렉토리 존재 여부를 확인하고 실행 모드를 결정한다.

1. `_workspace/` 확인:
   - **미존재** → 초기 실행. Phase 1로 진행.
   - **존재 + 부분 수정 요청** (예: "디자인만 다시", "QA 재실행") → 부분 재실행. 해당 Phase만 실행하고 기존 산출물 유지.
   - **존재 + 새 프로젝트 입력** → 새 실행. 기존 `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1 진행.

2. 부분 재실행 시: 이전 산출물 경로를 에이전트 프롬프트에 포함하여 기존 결과를 읽고 개선하도록 지시.

### Phase 1: 요구사항 분석

1. 사용자 입력 분석:
   - 프로젝트 목적 및 핵심 기능
   - 기술 스택 확인 (기본: Next.js + Prisma + PostgreSQL)
   - 인증 필요 여부
   - 배포 환경 (기본: Vercel)

2. `_workspace/00_input/requirements.md` 생성:
   ```markdown
   ## 프로젝트 개요
   - 목적: {사용자 입력}
   - 기술 스택: Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL
   - 인증: {필요/불필요}
   - 배포: {Vercel/기타}

   ## 핵심 페이지
   - {페이지 목록 추출}

   ## 핵심 기능
   - {기능 목록 추출}
   ```

### Phase 2: 설계 (에이전트 팀)
**실행 모드: 에이전트 팀**

#### 2-1. 팀 구성

```
TeamCreate(
  team_name: "web-design-team",
  members: [
    {
      name: "designer",
      agent_type: "designer",
      model: "opus",
      prompt: "당신은 웹사이트 UX/UI 디자이너입니다. `_workspace/00_input/requirements.md`를 읽고 design-system 스킬을 참조하여 설계 산출물을 작성하세요. 완성 후 frontend-dev에게 SendMessage로 검토를 요청하세요."
    },
    {
      name: "frontend-dev",
      agent_type: "frontend-dev",
      model: "opus",
      prompt: "당신은 Next.js 프론트엔드 개발자입니다. designer의 검토 요청을 받으면 와이어프레임의 구현 가능성을 검토하고 피드백을 SendMessage로 전달하세요. 구현 난이도가 높은 레이아웃이나 컴포넌트 구조 개선이 필요한 부분을 구체적으로 지적하세요."
    }
  ]
)
```

#### 2-2. 작업 등록

```
TaskCreate(tasks: [
  { title: "사용자 흐름 작성", description: "requirements.md 기반 페이지 이동 흐름 정의", assignee: "designer" },
  { title: "와이어프레임 작성", description: "페이지별 레이아웃 ASCII 와이어프레임", assignee: "designer", depends_on: ["사용자 흐름 작성"] },
  { title: "컴포넌트 목록 정의", description: "재사용 컴포넌트 추출 및 props 정의", assignee: "designer", depends_on: ["와이어프레임 작성"] },
  { title: "디자인 토큰 정의", description: "색상, 타이포, 간격 CSS Custom Properties", assignee: "designer" },
  { title: "와이어프레임 구현 검토", description: "designer의 설계물 검토 및 피드백", assignee: "frontend-dev", depends_on: ["컴포넌트 목록 정의"] }
])
```

#### 2-3. 팀 실행 및 모니터링

팀원들이 자체 조율하며 작업을 수행한다. 팀 통신 규칙:
- designer: 와이어프레임 초안 완성 → SendMessage("frontend-dev", "와이어프레임 초안 완성. 구현 난이도 검토 부탁드립니다: `_workspace/02_design/wireframes.md`")
- frontend-dev: 검토 완료 → SendMessage("designer", "피드백: [구체적 내용]")
- designer: 피드백 반영 후 최종 파일 저장

산출물 위치:
- `_workspace/02_design/user-flow.md`
- `_workspace/02_design/wireframes.md`
- `_workspace/02_design/components.md`
- `_workspace/02_design/design-tokens.md`

#### 2-4. 팀 정리

모든 설계 산출물 확인 후 `TeamDelete("web-design-team")`

### Phase 3: 구현 계획 (에이전트 팀)
**실행 모드: 에이전트 팀**

#### 3-1. 팀 구성

```
TeamCreate(
  team_name: "web-impl-team",
  members: [
    {
      name: "backend-dev",
      agent_type: "backend-dev",
      model: "opus",
      prompt: "당신은 백엔드 개발자입니다. `_workspace/00_input/requirements.md`와 `_workspace/02_design/user-flow.md`를 읽고 backend-api 스킬을 참조하여 API 스펙, DB 스키마, 인증 설계를 작성하세요. api-spec.md 완성 후 frontend-dev에게 SendMessage로 검토를 요청하세요."
    },
    {
      name: "frontend-dev",
      agent_type: "frontend-dev",
      model: "opus",
      prompt: "당신은 Next.js 프론트엔드 개발자입니다. `_workspace/02_design/` 전체를 읽고 nextjs-implementation 스킬을 참조하여 라우팅 구조, 컴포넌트 계층, 구현 계획을 작성하세요. backend-dev의 API 스펙 검토 요청 수신 시 훅 타입과의 정합성을 확인하고 피드백을 SendMessage로 전달하세요."
    }
  ]
)
```

#### 3-2. 작업 등록

```
TaskCreate(tasks: [
  { title: "API 스펙 작성", description: "엔드포인트별 request/response shape 정의", assignee: "backend-dev" },
  { title: "DB 스키마 설계", description: "Prisma 스키마 작성", assignee: "backend-dev" },
  { title: "인증 설계", description: "인증 방식 및 권한 레벨 정의", assignee: "backend-dev" },
  { title: "환경 변수 목록", description: "필요한 환경 변수 전체 목록", assignee: "backend-dev" },
  { title: "라우팅 구조 설계", description: "Next.js App Router 파일 구조 정의", assignee: "frontend-dev" },
  { title: "컴포넌트 계층 설계", description: "와이어프레임 기반 컴포넌트 트리 작성", assignee: "frontend-dev" },
  { title: "API 훅 타입 정의", description: "API 스펙 기반 훅 목록 및 타입 정의", assignee: "frontend-dev", depends_on: ["API 스펙 작성"] },
  { title: "구현 계획 수립", description: "1/2/3단계 구현 순서 및 의존성 정의", assignee: "frontend-dev", depends_on: ["API 훅 타입 정의"] }
])
```

#### 3-3. API 계약 합의

팀 통신 규칙:
- backend-dev: api-spec.md 완성 → SendMessage("frontend-dev", "API 스펙 초안 완성. 훅 타입과 정합성 확인 부탁: `_workspace/03_backend/api-spec.md`")
- frontend-dev: 훅 타입과 비교 → SendMessage("backend-dev", "피드백: [shape 불일치 항목, 조정 요청]")
- backend-dev: 피드백 반영 후 최종 스펙 확정

산출물 위치:
- `_workspace/03_backend/api-spec.md`
- `_workspace/03_backend/db-schema.md`
- `_workspace/03_backend/auth-design.md`
- `_workspace/03_backend/env-vars.md`
- `_workspace/03_frontend/component-tree.md`
- `_workspace/03_frontend/page-structure.md`
- `_workspace/03_frontend/api-hooks.md`
- `_workspace/03_frontend/implementation-plan.md`

#### 3-4. 팀 정리

모든 구현 산출물 확인 후 `TeamDelete("web-impl-team")`

### Phase 4: QA 검증 (서브 에이전트)
**실행 모드: 서브 에이전트**

```
Agent(
  description: "QA 경계면 검증",
  subagent_type: "qa-engineer",
  model: "opus",
  prompt: """
당신은 QA 엔지니어입니다. web-qa 스킬을 참조하여 다음 파일들을 교차 검증하세요:

- `_workspace/03_backend/api-spec.md` (API 응답 shape)
- `_workspace/03_frontend/api-hooks.md` (프론트 훅 타입)
- `_workspace/03_frontend/page-structure.md` (라우팅 구조)

수행 작업:
1. API ↔ 훅 타입 1:1 매핑 테이블 작성
2. 라우팅 경로 ↔ 링크 href 정합성 확인
3. 타입 위험 지점(`any`, `as`) 식별
4. 테스트 계획 수립 (단위/통합/E2E)
5. 이슈 목록 작성 (심각도 포함)

산출물 저장:
- `_workspace/04_qa/boundary-check.md`
- `_workspace/04_qa/test-plan.md`
- `_workspace/04_qa/issues.md`
  """
)
```

### Phase 5: 배포 설계 (서브 에이전트)
**실행 모드: 서브 에이전트**

QA 이슈 확인 후 CRITICAL 이슈가 없으면 배포 설계 진행. CRITICAL 이슈가 있으면 사용자에게 보고 후 진행 여부 확인.

```
Agent(
  description: "배포 환경 설계",
  subagent_type: "devops",
  model: "opus",
  prompt: """
당신은 DevOps 엔지니어입니다. 다음 파일을 참조하여 배포 설계를 작성하세요:

- `_workspace/03_backend/env-vars.md` (환경 변수 목록)
- `_workspace/04_qa/issues.md` (QA 이슈 현황)

배포 환경: Vercel (기본값, 요구사항에 따라 조정)

수행 작업:
1. GitHub Actions CI/CD 워크플로우 설계 (lint → typecheck → test → build → deploy)
2. Vercel 배포 설정 가이드
3. 환경 변수 설정 가이드
4. 배포 전 체크리스트 및 롤백 계획

산출물 저장:
- `_workspace/05_deploy/ci-cd.md`
- `_workspace/05_deploy/deployment-guide.md`
- `_workspace/05_deploy/env-setup.md`
- `_workspace/05_deploy/checklist.md`
  """
)
```

### Phase 6: 최종 보고

모든 산출물을 수집하여 `_workspace/SUMMARY.md` 생성:

```markdown
# 웹사이트 개발 하네스 실행 결과

## 설계 산출물 (Phase 2)
- [사용자 흐름](_workspace/02_design/user-flow.md)
- [와이어프레임](_workspace/02_design/wireframes.md)
- [컴포넌트 목록](_workspace/02_design/components.md)
- [디자인 토큰](_workspace/02_design/design-tokens.md)

## 구현 계획 (Phase 3)
- [API 스펙](_workspace/03_backend/api-spec.md)
- [DB 스키마](_workspace/03_backend/db-schema.md)
- [라우팅 구조](_workspace/03_frontend/page-structure.md)
- [API 훅](_workspace/03_frontend/api-hooks.md)
- [구현 계획](_workspace/03_frontend/implementation-plan.md)

## QA 검증 (Phase 4)
- [경계면 검증](_workspace/04_qa/boundary-check.md)
- [테스트 계획](_workspace/04_qa/test-plan.md)
- [이슈 목록](_workspace/04_qa/issues.md)

## 배포 설계 (Phase 5)
- [CI/CD](_workspace/05_deploy/ci-cd.md)
- [배포 가이드](_workspace/05_deploy/deployment-guide.md)
- [체크리스트](_workspace/05_deploy/checklist.md)

## 주요 이슈 요약
{issues.md에서 CRITICAL/HIGH 이슈 요약}

## 다음 단계
1. 구현 계획 기반으로 실제 코드 작성 시작
2. QA 이슈 해결 후 배포 진행
```

---

## 데이터 흐름

```
requirements.md
    │
    ├─[Phase 2: 에이전트 팀]─────────────────────────────────────────┐
    │  designer ←SendMessage→ frontend-dev                           │
    │  └→ 02_design/{wireframes, components, design-tokens, user-flow}.md │
    │                                                                 │
    ├─[Phase 3: 에이전트 팀]─────────────────────────────────────────┤
    │  backend-dev ←SendMessage→ frontend-dev                        │
    │  ├→ 03_backend/{api-spec, db-schema, auth-design, env-vars}.md │
    │  └→ 03_frontend/{component-tree, page-structure, api-hooks, impl-plan}.md │
    │                                                                 │
    ├─[Phase 4: 서브 에이전트]───────────────────────────────────────┤
    │  qa-engineer                                                    │
    │  └→ 04_qa/{boundary-check, test-plan, issues}.md               │
    │                                                                 │
    └─[Phase 5: 서브 에이전트]───────────────────────────────────────┘
       devops
       └→ 05_deploy/{ci-cd, deployment-guide, env-setup, checklist}.md
```

---

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| 설계 팀 에이전트 실패 | 1회 재시작 시도 → 재실패 시 부분 산출물로 Phase 3 진행 |
| API 계약 합의 교착 | 오케스트레이터가 개입, backend-dev 기준으로 최종 결정 |
| QA CRITICAL 이슈 발견 | 사용자에게 보고, 이슈 해결 확인 후 Phase 5 진행 |
| 팀 전환 시 산출물 누락 | `_workspace/` 파일 목록 확인, 누락 에이전트만 재호출 |
| 서브 에이전트 타임아웃 | 현재까지 수집된 결과 사용, SUMMARY.md에 누락 명시 |

---

## 테스트 시나리오

### 정상 흐름
1. 사용자: "SaaS 랜딩 페이지와 대시보드 웹사이트 만들어줘"
2. Phase 0: `_workspace/` 없음 → 초기 실행
3. Phase 1: requirements.md 생성 (홈, 로그인, 대시보드 3개 페이지)
4. Phase 2: 설계 팀 생성 → designer 와이어프레임 작성 → frontend-dev 피드백 → 최종 설계 확정 → TeamDelete
5. Phase 3: 구현 팀 생성 → backend-dev API 스펙 작성 → frontend-dev 훅 타입 정합성 확인 → 합의 → TeamDelete
6. Phase 4: qa-engineer 서브 에이전트 → 경계면 검증 → issues.md (CRITICAL 없음)
7. Phase 5: devops 서브 에이전트 → CI/CD + Vercel 배포 설계
8. Phase 6: SUMMARY.md 생성 및 사용자 보고
9. 예상 결과: `_workspace/SUMMARY.md` + 모든 산출물 파일 생성

### 에러 흐름: QA CRITICAL 이슈
1. Phase 4에서 qa-engineer가 API↔훅 shape 불일치 발견 (CRITICAL-001)
2. issues.md에 기록: "GET /api/projects 응답의 래핑 구조 불일치"
3. 오케스트레이터가 SUMMARY.md에 CRITICAL 이슈 포함 보고
4. 사용자에게 알림: "CRITICAL 이슈 1건 발견. 해결 후 배포 진행을 권장합니다. 배포 설계를 계속 진행할까요?"
5. 사용자 확인 후 Phase 5 진행 또는 해당 에이전트 재호출로 수정
