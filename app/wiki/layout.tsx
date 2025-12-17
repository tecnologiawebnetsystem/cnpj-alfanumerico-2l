import type React from "react"
import { WikiChatbot } from "@/components/wiki/ai-chatbot"

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WikiChatbot />
    </>
  )
}
