키워드를 입력하면 자동으로 카드뉴스를 만드는 웹 개발할거야. 
팀 에이전트 형식으로 구성해줘. 
프로세스: 
1. 키워드 입력
2. 웹에서 키워드 관련 정보 검색
3. 검색 정보 중 필요한 내용만 모으기(정리)
4. 예시 템플릿 보고 템플릿에 맞춰서 내용 구축하기(템플릿 만들 곳 필요)
5. 각 페이지에 맞는 이미지 한 장씩 웹에서 검색, 실패했다면 ai로 이미지 생성 후 알맞는 페이지에 위치
6. 완성된 카드 뉴스 나열.

각 프로세스마다 에이전트 팀을 구성해. 
모든 프로세스가 완료 되면, 프로세스 별로 페이지를 만들어서, 각 페이지에 프로세스 과정과 결과를 확인할 수 있도록 해야돼. 
일단은 db만들지 말고 간단하게 로컬에 저장하게 하자
외부 api 키 입력할 곳도 만들어줘

Frontend: React/Vite 또는 Next.js 화면
Backend API: Node/Express 또는 Next.js API Route
DB: 없음
Storage: 일단 메모리 state 또는 localStorage
임시 External APIs:
- LLM API
- Web Search API
- Image Search API