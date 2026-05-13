# 카드뉴스 자동 생성 웹앱 — 요구사항

## 프로젝트 개요
- **목적**: 키워드 입력 → 6단계 파이프라인(검색→정리→템플릿→이미지→조립)으로 카드뉴스를 자동 생성
- **기술 스택**: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, SSE
- **인증**: 불필요 (API 키 입력 UI만 제공)
- **배포**: Vercel (로컬 개발 우선)
- **DB**: 없음 — 서버 in-memory Map + localStorage

## 핵심 페이지
- `/` — 키워드 입력 + 템플릿 선택 + 생성 이력
- `/settings` — API 키 관리 (OpenAI, Serper, Unsplash)
- `/pipeline/[jobId]` — 6단계 파이프라인 실시간 현황 (SSE)
- `/pipeline/[jobId]/step/[stepId]` — 단계별 입력/로그/출력 상세
- `/pipeline/[jobId]/result` — 완성된 카드뉴스 갤러리

## 핵심 기능
1. 키워드 입력 → jobId 발급 → 파이프라인 시작
2. Step 2: Serper API로 웹 검색 (일반+뉴스, 중복 제거)
3. Step 3: LLM으로 핵심 사실 5-10개 추출 (JSON mode)
4. Step 4: LLM으로 슬롯별 슬라이드 생성 + **사용자 인라인 편집**
5. Step 5: Unsplash 검색 → 실패 시 DALL-E → 실패 시 placeholder
6. Step 6: 최종 CardNews 조립 + 메타데이터
7. SSE로 각 단계 실시간 진행 상황 스트리밍
8. localStorage에 완성된 카드뉴스 + API 키 저장

## 외부 API
- **OpenAI** (LLM: gpt-4o, DALL-E 이미지 생성)
- **Serper** (웹 검색)
- **Unsplash** (이미지 검색)

## 비기능 요구사항
- API 키 없이도 UI 탐색 가능 (키 미설정 시 명확한 에러 표시)
- 각 단계 5~30초 소요 → SSE로 실시간 업데이트
- 이미지 fallback 체인 (Unsplash → DALL-E → placeholder) 보장
