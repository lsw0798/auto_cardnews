---
name: design-system
description: "웹사이트 와이어프레임 작성, 컴포넌트 목록 정의, 디자인 토큰(색상/타이포/간격) 설계, 사용자 흐름 설계. 디자인 단계 작업 시 반드시 이 스킬을 사용. 설계 산출물이 요청되면 항상 트리거."
---

# Design System Skill

웹사이트 설계 산출물을 체계적으로 생성하는 스킬. 와이어프레임부터 디자인 토큰까지 프론트엔드 개발자가 바로 구현에 착수할 수 있는 수준의 문서를 만든다.

## 산출물 1: 사용자 흐름 (user-flow.md)

요구사항에서 페이지 목록을 추출하고 이동 흐름을 정의한다.

```markdown
## 페이지 목록
| 페이지 | 경로 | 인증 필요 | 설명 |
|--------|------|----------|------|
| 홈     | /    | 불필요   | 랜딩 |

## 이동 흐름
홈(/) → [로그인 클릭] → 로그인(/login) → [성공] → 대시보드(/dashboard)
```

## 산출물 2: 와이어프레임 (wireframes.md)

각 페이지를 섹션/컴포넌트 단위로 구조화. ASCII 레이아웃으로 표현.

```markdown
## 홈 페이지 (/)

### 레이아웃
┌─────────────────────────────┐
│ Header: Logo | Nav | CTA    │
├─────────────────────────────┤
│ Hero: 제목 + 부제 + 버튼    │
├─────────────────────────────┤
│ Features: 3열 카드 그리드   │
├─────────────────────────────┤
│ Footer                      │
└─────────────────────────────┘

### 반응형 동작
- mobile(320): 1열, 햄버거 메뉴
- tablet(768): 2열, 축약 nav
- desktop(1024+): 3열, 전체 nav
```

## 산출물 3: 컴포넌트 목록 (components.md)

와이어프레임에서 재사용 컴포넌트를 추출한다.

```markdown
## 원자 컴포넌트 (components/ui/)
| 컴포넌트 | Props | 용도 |
|---------|-------|------|
| Button  | variant, size, onClick, disabled | 모든 버튼 |
| Input   | type, placeholder, value, onChange, error | 폼 입력 |

## 복합 컴포넌트 (components/{feature}/)
| 컴포넌트 | Props | 용도 |
|---------|-------|------|
| FeatureCard | title, desc, icon | Features 섹션 카드 |
| NavBar | items, isLoggedIn | 전체 내비게이션 |
```

## 산출물 4: 디자인 토큰 (design-tokens.md)

CSS Custom Properties 형태로 정의. 토큰이 없으면 기본값을 제안.

```markdown
## 색상
```css
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-surface: #FFFFFF;
  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-error: #DC2626;
}
```

## 타이포그래피
```css
:root {
  --font-sans: 'Pretendard', system-ui, sans-serif;
  --text-hero: clamp(2.5rem, 5vw, 4rem);
  --text-h1: clamp(1.75rem, 3vw, 2.5rem);
  --text-h2: 1.5rem;
  --text-body: 1rem;
  --text-small: 0.875rem;
}
```

## 간격
```css
:root {
  --space-section: clamp(4rem, 8vw, 8rem);
  --space-component: 2rem;
  --space-element: 1rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

## 작업 순서

1. 요구사항에서 페이지 목록 및 핵심 기능 추출
2. 사용자 흐름 작성 → `_workspace/02_design/user-flow.md`
3. 페이지별 와이어프레임 작성 → `_workspace/02_design/wireframes.md`
4. 와이어프레임에서 컴포넌트 추출 → `_workspace/02_design/components.md`
5. 디자인 토큰 정의 → `_workspace/02_design/design-tokens.md`
6. frontend-dev에게 SendMessage로 검토 요청

## frontend-dev 피드백 반영

피드백 수신 후:
- 구현 불가 레이아웃은 단순화
- 컴포넌트 과도한 중첩은 평탄화
- 수정 사항을 해당 파일에 반영하고 TaskUpdate
