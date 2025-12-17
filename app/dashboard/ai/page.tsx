import { SemanticSearch } from "@/components/ai/semantic-search"
import { Card } from "@/components/ui/card"
import { Sparkles, Brain, Zap } from "lucide-react"

export default function AIPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-500" />
          Recursos de IA
        </h1>
        <p className="text-muted-foreground">Ferramentas inteligentes para acelerar seu trabalho</p>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Sugestões de Código</h3>
          </div>
          <p className="text-sm text-muted-foreground">IA gera correções automáticas para campos CNPJ identificados</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Busca Semântica</h3>
          </div>
          <p className="text-sm text-muted-foreground">Encontre análises e tarefas usando linguagem natural</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Chatbot Especialista</h3>
          </div>
          <p className="text-sm text-muted-foreground">Assistente 24/7 para dúvidas sobre CNPJ alfanumérico</p>
        </Card>
      </div>

      <SemanticSearch />
    </div>
  )
}
