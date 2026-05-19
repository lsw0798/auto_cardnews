import type { CardSlide } from "@/types"

export interface ExampleFeed {
  keyword: string
  slides: CardSlide[]
}

export const EXAMPLE_FEEDS: ExampleFeed[] = [
  {
    keyword: "Manus",
    slides: [
      {
        slideIndex: 1,
        slotType: "title",
        title: "대답 안하고 일하는 AI Manus",
        body: "",
      },
      {
        slideIndex: 2,
        slotType: "content",
        title: "또 챗봇 하나 나왔네? 했는데",
        subtext: "2025년 등장한 '실행형' AI 에이전트",
        body: [
          "2025년 3월 공개된 범용 AI 에이전트",
          "중국 스타트업 Butterfly Effect Technology가 개발한 서비스로 알려짐",
          "단순 답변이 아니라 실제 작업 수행에 초점이 맞춰짐",
        ].join("\n"),
      },
      {
        slideIndex: 3,
        slotType: "content",
        title: "에이전트 AI? GPT랑 뭐가 다름?",
        subtext: "답하는 AI vs 실행하는 AI",
        body: [
          "일반 AI는 답변, 요약, 초안 작성에 강함",
          "에이전트 AI는 목표를 주면 검색, 실행, 정리까지 수행",
          "Manus처럼 웹 탐색, 앱 상호작용, 코드 실행까지 연결되는 서비스",
        ].join("\n"),
      },
      {
        slideIndex: 4,
        slotType: "content",
        title: "얘 왜 혼자 일하는 것처럼 보이냐고",
        subtext: "Manus의 핵심은 ‘비동기 작업’",
        body: [
          "작업을 가상 컴퓨터 환경에서 따로 수행",
          "목표를 잘게 나누고, 할 일을 순서대로 처리",
          "브라우저 제어, 파일 편집, 코드 실행 등을 함께 활용",
          "그래서 답변형 AI보다 “업무 대행형 AI”처럼 보임",
        ].join("\n"),
      },
      {
        slideIndex: 5,
        slotType: "content",
        title: "그래서 어디까지 해주는데?",
        subtext: "Manus 실전 예시",
        body: [
          "특정 신발 브랜드 영상 광고 제작",
          "웹사이트 생성 및 호스팅",
          "리서치 및 ppt 슬라이드 제작",
          "“찾아주는 AI”보다 “만들어주는 AI”에 가까움",
        ].join("\n"),
      },
      {
        slideIndex: 6,
        slotType: "content",
        title: "근데 왜 이렇게까지 난리였을까",
        subtext: "기술력 + 희소성 + 서사가 같이 붙었다",
        body: [
          "여러 AI와 도구를 잘 엮어 실제 업무처럼 작동시킨 점이 주목받음",
          "“중국발 차세대 AI 에이전트” 이미지로 화제",
          "LLM → 에이전트로 넘어가는 흐름에서 등장",
        ].join("\n"),
      },
      {
        slideIndex: 7,
        slotType: "outro",
        title: "그래서 평가는?",
        subtext: "기대와 한계가 동시에 존재",
        body: [
          "호평: 자율적으로 일 처리하는 경험이 신선하다는 반응",
          "리서치, 자료 정리, 결과물 생성 능력 주목",
          "한계: 불안정성 지적 존재, 아직 gpt등이 더 익숙함",
          "-> 결론: 완성형보다는 가능성을 보여준 AI 에이전트",
        ].join("\n"),
      },
    ],
  },
  {
    keyword: "Claude in Powerpoint",
    slides: [
      {
        slideIndex: 1,
        slotType: "title",
        title: "PPT 안의 claude! Claude in Powerpoint",
        body: "",
      },
      {
        slideIndex: 2,
        slotType: "content",
        title: "AI 기반 프레젠테이션 제작 웹",
        subtext: "AI를 이용한 PPT 제작 자동화 도구",
        body: [
          "Gamma AI/Canva AI/NotebookLM...",
          "프롬프트와 관련 소스를 입력하면 한 번에 ppt 제작",
          "웹에서 제작 후 ppt 내보내기 따로 해야됨",
          "-> 레이아웃 깨지는 문제, 차트 기능 약함",
          "Nanobana, NotebookLM의 경우는 pdf형식으로 출력 되기 때문에 수정이 불가능",
        ].join("\n"),
      },
      {
        slideIndex: 3,
        slotType: "content",
        title: "Claude by Anthropic in PowerPoint",
        subtext: "Anthropic에서 2026년 2월에 베타버전 첫 출시",
        body: [
          "AI 어시스턴트 Claude를 Microsoft PowerPoint에",
          "통합한 애드인(Add-in)형태",
          "Sonnet 4.5, Opus 4.6 모델 사용",
          "microsoft marketplace에서 설치 후 플러그인 형식으로 쉽게 사용 가능",
        ].join("\n"),
      },
      {
        slideIndex: 4,
        slotType: "content",
        title: "파워포인트 내 AI 실시간 수정",
        subtext: "앱 전환 없는 워크플로우",
        body: [
          "브라우저와 파워포인트를 오갈 필요 없이 내부에서 Claude와 대화하며 수정 사항을 바로 반영",
          "기존 디자인 포맷, 글자 폰트도 유지 가능",
        ].join("\n"),
      },
      {
        slideIndex: 5,
        slotType: "content",
        title: "파일 업로드로 정확한 데이터 처리",
        subtext: "Claude 기본 기능과 연동 - 디자인 보완 뿐만이 아님",
        body: [
          "csv 파일, 엑셀 스프레드시트 등 문서를 소스로 제공하고",
          "원하는 내용을 말하면 claude가 자동으로 슬라이드 제작",
          "Excel/PDF 업로드 → 차트·도형 자동 생성",
          "자동 웹 검색/분석 기능",
        ].join("\n"),
      },
      {
        slideIndex: 6,
        slotType: "content",
        title: "하지만 너무 비싼 가격..",
        subtext: "가격이 만만치 않음",
        body: [
          "현재 Claude Max, Team, Enterprise 플랜 전용(Claude Max 가격: 100$/월)",
          "또한 성능 면으로, 아직까지는 디자인, 색상 선택 등 어색한 부분이 생김",
        ].join("\n"),
      },
      {
        slideIndex: 7,
        slotType: "content",
        title: "대체로 긍정적 평가",
        subtext: "전체적으로 컨설팅/비즈니스 사용자들이 만족도가 높다",
        body: [
          "품질, 시간 절약 면에서 긍정적인 반응",
          "copilot보다 높은 성능",
          "하지만 출시 초기이기 때문에 텍스트가 겹치는 등 아직은 완벽하지 않다는 평도 보인다"
        ].join("\n"),
      },
      {
        slideIndex: 8,
        slotType: "outro",
        title: "나도 써보게 가격 좀 싸졌으면 좋겠다",
        body: [
          "PowerPoint 내부에서 claude와 연동할 수 있다는 점은 충분한 강점",
          "AI 기반 PPT 자동화 도구는 빠르게 발전중임을 실감함",
          "현재 아쉬운 점들 보완 되어서 정식 출시 되길 기대",
          "무료까지는 아니어도 Pro 플랜만으로 쓸 수 있다면 사용해 보고 싶다.."
        ].join("\n"),
      },
    ],
  },
]
