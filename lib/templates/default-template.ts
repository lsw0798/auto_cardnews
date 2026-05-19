import type { CardTemplate } from "@/types"

export const DEFAULT_TEMPLATE: CardTemplate = {
  id: "default-6slot",
  name: "기본 카드뉴스",
  description: "표지-소개-본문2개-하이라이트-마무리",
  slots: ["title", "content", "content", "content", "outro"],
}
