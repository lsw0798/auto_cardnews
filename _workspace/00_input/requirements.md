# 프로젝트 요구사항

## 프로젝트 개요
- **목적**: 키워드를 입력하면 자동으로 카드뉴스를 생성하는 웹앱
- **기술 스택**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **인증**: 불필요
- **DB**: 없음 (localStorage / 메모리 state)
- **배포**: Vercel

## 핵심 파이프라인 (6단계 프로세스)

| 단계 | 이름 | 설명 |
|------|------|------|
| Step 1 | 키워드 입력 | 사용자가 카드뉴스 주제 키워드 입력 |
| Step 2 | 웹 검색 | 키워드로 관련 정보 웹에서 자동 검색 |
| Step 3 | 정보 정리 | 검색 결과에서 핵심 내용만 LLM으로 추출/요약 |
| Step 4 | 템플릿 구성 | 예시 템플릿 선택 후 정리된 내용으로 카드 구성 |
| Step 5 | 이미지 배치 | 카드별 이미지 웹 검색 → 실패 시 AI 이미지 생성 |
| Step 6 | 카드뉴스 완성 | 완성된 카드뉴스 나열 및 미리보기 |

## 핵심 페이지

- `/` — 홈 (키워드 입력 + 실행 트리거)
- `/process` — 프로세스 진행 현황 (각 단계 상태 + 결과 확인)
- `/process/[step]` — 단계별 상세 과정 및 결과 보기
- `/result` — 완성된 카드뉴스 최종 보기
- `/settings` — 외부 API 키 관리 (LLM, Web Search, Image Search)
- `/templates` — 카드뉴스 템플릿 관리 (템플릿 추가/편집/삭제)

## 핵심 기능

### API 연동
- **LLM API**: 정보 요약 및 카드 내용 생성 (OpenAI / Anthropic 지원)
- **Web Search API**: 키워드 관련 정보 검색 (Tavily / SerpAPI / Brave Search)
- **Image Search API**: 카드별 이미지 검색 (Unsplash / Pexels)
- **AI Image Generation**: 이미지 검색 실패 시 대체 생성 (DALL-E / Stability AI)

### 저장소
- API 키: localStorage (암호화 없이 클라이언트 저장)
- 진행 중 세션: 메모리 state (Zustand)
- 생성된 카드뉴스 히스토리: localStorage

### 실시간 진행 표시
- 각 단계 진행 상태 (대기/진행중/완료/오류)
- 단계별 중간 결과 확인 가능 (클릭으로 상세 보기)
- 전체 파이프라인 진행률 표시

### 템플릿 시스템
- 기본 제공 템플릿 3종 이상
- 템플릿 커스터마이징 (배경색, 폰트, 레이아웃)
- 템플릿 미리보기

## 외부 API 키 목록
- `LLM_API_KEY` — OpenAI 또는 Anthropic API 키
- `LLM_MODEL` — 사용할 모델 (예: gpt-4o, claude-sonnet-4-6)
- `SEARCH_API_KEY` — 웹 검색 API 키
- `SEARCH_PROVIDER` — 검색 제공자 (tavily / serpapi / brave)
- `IMAGE_API_KEY` — 이미지 검색 API 키
- `IMAGE_PROVIDER` — 이미지 제공자 (unsplash / pexels)
- `IMAGE_GEN_API_KEY` — AI 이미지 생성 API 키 (선택)

## 기술적 제약
- DB 없음: 모든 상태는 localStorage 또는 메모리 state
- API Routes: 외부 API 키를 클라이언트에 직접 노출하지 않기 위해 서버사이드 프록시 사용
- 이미지: Next.js Image 컴포넌트 사용, 외부 도메인 허용 설정 필요
- 스트리밍: LLM 응답 스트리밍 지원 (Server-Sent Events)
