"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Bot,
  Send,
  Loader2,
  Code,
  Lightbulb,
  FileQuestion,
  Sparkles,
  Copy,
  Check,
  Wand2,
  MessageSquare,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  codeBlocks?: { language: string; code: string }[]
  timestamp: Date
}

interface DevAIAssistantProps {
  taskId?: string
  taskTitle?: string
  taskCode?: string
  suggestedCode?: string
  filePath?: string
  userId: string
  clientId?: string
  currentTask?: any
  isOpen?: boolean
  onClose?: () => void
}

export function DevAIAssistant({
  taskId,
  taskTitle,
  taskCode,
  suggestedCode,
  filePath,
  userId,
  clientId,
  currentTask,
  isOpen: externalIsOpen,
  onClose,
}: DevAIAssistantProps) {
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Use external or internal open state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen
  const setIsOpen = (open: boolean) => {
    if (externalIsOpen !== undefined && onClose && !open) {
      onClose()
    } else {
      setInternalOpen(open)
    }
  }

  // Quick actions
  const quickActions = [
    { icon: Code, label: "Explicar codigo", prompt: "Explique o codigo atual e o problema que precisa ser corrigido" },
    { icon: Wand2, label: "Gerar correcao", prompt: "Gere o codigo corrigido para este problema" },
    { icon: Lightbulb, label: "Sugestoes", prompt: "Quais sao as melhores praticas para essa correcao?" },
    { icon: FileQuestion, label: "Duvidas", prompt: "Tenho duvidas sobre como implementar essa mudanca" },
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/dev/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          task_id: taskId,
          task_title: taskTitle,
          task_code: taskCode,
          suggested_code: suggestedCode,
          file_path: filePath,
          user_id: userId,
          client_id: clientId,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Parse code blocks from response
      const codeBlocks: { language: string; code: string }[] = []
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      let match
      while ((match = codeBlockRegex.exec(data.response)) !== null) {
        codeBlocks.push({
          language: match[1] || "text",
          code: match[2].trim(),
        })
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Nao foi possivel obter resposta da IA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: "Codigo copiado!",
      description: "O codigo foi copiado para a area de transferencia",
    })
  }

  const formatMessage = (content: string) => {
    // Remove code blocks for display (they are shown separately)
    const withoutCode = content.replace(/```[\s\S]*?```/g, "[CODIGO]")
    return withoutCode.split("\n").map((line, i) => (
      <p key={i} className={line.startsWith("-") ? "ml-2" : ""}>
        {line || <br />}
      </p>
    ))
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-violet-600 to-purple-600">
          <SheetTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Assistente IA de Codigo
          </SheetTitle>
        </SheetHeader>

        {/* Quick Actions */}
        <div className="p-3 border-b bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
                onClick={() => sendMessage(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Task Context */}
        {taskTitle && (
          <div className="p-3 border-b bg-blue-50">
            <p className="text-xs text-muted-foreground">Tarefa atual:</p>
            <p className="text-sm font-medium truncate">{taskTitle}</p>
            {filePath && (
              <Badge variant="outline" className="mt-1 text-xs font-mono">
                {filePath}
              </Badge>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Ola! Sou seu assistente de codigo.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Posso explicar o codigo, gerar correcoes e tirar duvidas.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="text-sm">{formatMessage(message.content)}</div>

                  {/* Code blocks */}
                  {message.codeBlocks?.map((block, i) => (
                    <div key={i} className="mt-2 rounded-md overflow-hidden border">
                      <div className="flex items-center justify-between px-3 py-1 bg-gray-800 text-white text-xs">
                        <span>{block.language}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-white hover:bg-gray-700"
                          onClick={() => copyCode(block.code, `${message.id}-${i}`)}
                        >
                          {copiedId === `${message.id}-${i}` ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-3 bg-gray-900 text-green-400 text-xs overflow-x-auto">
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  ))}

                  <p className="text-[10px] mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre o codigo..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
