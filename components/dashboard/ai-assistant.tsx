"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Bot, 
  Code, 
  FileText, 
  HelpCircle, 
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  Minimize2,
  Maximize2,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  type?: "text" | "code" | "report"
  timestamp: Date
}

interface AIAssistantProps {
  clientId?: string
  context?: "dashboard" | "analysis" | "tasks" | "general"
  analysisId?: string
  onClose?: () => void
  minimized?: boolean
  onToggleMinimize?: () => void
}

const QUICK_ACTIONS = [
  { label: "Gerar Relatorio", icon: FileText, prompt: "Gere um relatorio executivo das analises recentes", type: "report" },
  { label: "Codigo de Correcao", icon: Code, prompt: "Gere codigo de correcao para os CNPJs encontrados", type: "code" },
  { label: "Ajuda do Sistema", icon: HelpCircle, prompt: "Explique como usar o sistema de analise de CNPJ", type: "help" },
  { label: "Prioridades", icon: Sparkles, prompt: "Quais sao as correcoes mais urgentes?", type: "priority" },
]

export function AIAssistant({ 
  clientId, 
  context = "general", 
  analysisId,
  onClose,
  minimized = false,
  onToggleMinimize
}: AIAssistantProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const sendMessage = async (customPrompt?: string, type?: string) => {
    const messageText = customPrompt || input
    if (!messageText.trim()) return

    const userMessage: Message = { 
      id: generateId(),
      role: "user", 
      content: messageText,
      timestamp: new Date()
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageText, 
          clientId,
          context,
          analysisId,
          type: type || "text",
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      
      const assistantMessage: Message = { 
        id: generateId(),
        role: "assistant", 
        content: data.response,
        type: data.type || "text",
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem para a IA",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: "Copiado!",
      description: "Conteudo copiado para a area de transferencia",
    })
  }

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearChat = () => {
    setMessages([])
  }

  const renderMessageContent = (msg: Message) => {
    if (msg.type === "code") {
      return (
        <div className="space-y-2">
          <pre className="bg-zinc-900 text-zinc-100 p-3 rounded-md text-xs overflow-x-auto">
            <code>{msg.content}</code>
          </pre>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs bg-transparent"
              onClick={() => copyToClipboard(msg.content, msg.id)}
            >
              {copiedId === msg.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Copiar
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs bg-transparent"
              onClick={() => downloadAsFile(msg.content, `correcao-cnpj-${Date.now()}.txt`)}
            >
              <Download className="h-3 w-3 mr-1" />
              Baixar
            </Button>
          </div>
        </div>
      )
    }

    if (msg.type === "report") {
      return (
        <div className="space-y-2">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs bg-transparent"
              onClick={() => copyToClipboard(msg.content, msg.id)}
            >
              {copiedId === msg.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Copiar
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs bg-transparent"
              onClick={() => downloadAsFile(msg.content, `relatorio-${Date.now()}.md`)}
            >
              <Download className="h-3 w-3 mr-1" />
              Baixar MD
            </Button>
          </div>
        </div>
      )
    }

    return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
  }

  if (minimized) {
    return (
      <Button
        onClick={onToggleMinimize}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg bg-[#0052CC] hover:bg-[#0052CC]/90 z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="border-[#0052CC]/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#0052CC]">
            <Bot className="h-5 w-5" />
            Assistente IA
            <Badge variant="secondary" className="text-xs">Gemini</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onToggleMinimize && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Sparkles className="h-4 w-4 mr-2" />
              Acoes Rapidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-[#0052CC]/5 hover:border-[#0052CC]/30 bg-transparent"
                  onClick={() => {
                    setActiveTab("chat")
                    sendMessage(action.prompt, action.type)
                  }}
                  disabled={loading}
                >
                  <action.icon className="h-5 w-5 text-[#0052CC]" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-4 space-y-4">
            <ScrollArea className="h-[350px] pr-4" ref={scrollRef}>
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">Como posso ajudar?</p>
                    <p className="text-xs mt-1">Pergunte sobre analises, gere codigo ou relatorios</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => sendMessage("Quais CNPJs precisam ser corrigidos com urgencia?")}
                      >
                        CNPJs urgentes
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => sendMessage("Gere um exemplo de codigo para validar CNPJ alfanumerico")}
                      >
                        Codigo exemplo
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => sendMessage("Como funciona o sistema de analise?")}
                      >
                        Ajuda
                      </Badge>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        msg.role === "user" 
                          ? "bg-[#0052CC] text-white" 
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      {renderMessageContent(msg)}
                      <p className="text-[10px] opacity-60 mt-1">
                        {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Pergunte algo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-[#0052CC] hover:bg-[#0052CC]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Floating version for dashboard
export function FloatingAIAssistant({ clientId }: { clientId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  if (!isOpen && isMinimized) {
    return (
      <Button
        onClick={() => { setIsOpen(true); setIsMinimized(false) }}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg bg-[#0052CC] hover:bg-[#0052CC]/90 z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[400px] z-50">
      <AIAssistant 
        clientId={clientId}
        context="dashboard"
        onClose={() => { setIsOpen(false); setIsMinimized(true) }}
        minimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
      />
    </div>
  )
}
