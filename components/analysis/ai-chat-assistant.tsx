"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Loader2, Bot } from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIChatAssistantProps {
  analysisId: string
}

export function AIChatAssistant({ analysisId }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, analysisId }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage: Message = { role: "assistant", content: data.response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error("Erro ao enviar mensagem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#0052CC]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0052CC]">
          <MessageSquare className="h-5 w-5" />
          Chat com IA - Gemini
        </CardTitle>
        <CardDescription>Pergunte sobre prioridades, estimativas e planos de ação</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Faça uma pergunta sobre a análise</p>
              <p className="text-xs mt-1">Ex: &quot;Quais são os 5 CNPJs mais urgentes?&quot;</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user" ? "bg-[#0052CC] text-white" : "bg-muted text-foreground border border-border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 border border-border">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Pergunte sobre a análise..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#0052CC] hover:bg-[#0052CC]/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
