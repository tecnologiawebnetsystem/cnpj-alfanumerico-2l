import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, Bell, Smartphone, Brain, Calendar } from "lucide-react"

export function RoadmapSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Em Desenvolvimento
          </Badge>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Próximas Implementações
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos finalizando recursos inovadores para tornar sua experiência ainda melhor
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-primary">Lançamento previsto: 15 de Dezembro de 2025</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* WhatsApp Notifications */}
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Alta Prioridade</Badge>
              </div>
              <CardTitle className="text-xl">Notificações WhatsApp</CardTitle>
              <CardDescription>Alertas em tempo real no seu celular</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Análise concluída com resumo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Tarefas atribuídas a você</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Alertas de prazos e sprints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Resumos diários personalizados</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Mobile App */}
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Mobile</Badge>
              </div>
              <CardTitle className="text-xl">App iOS e Android</CardTitle>
              <CardDescription>Gestão completa na palma da mão</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Push notifications nativas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Dashboard mobile otimizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Aprovação de tarefas offline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Visualização de relatórios</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20">
                  Inteligência Artificial
                </Badge>
              </div>
              <CardTitle className="text-xl">Chatbot IA Avançado</CardTitle>
              <CardDescription>Assistente inteligente contextual</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Perguntas sobre suas análises</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Sugestões inteligentes de correção</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Análise preditiva de débitos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Treinado no seu contexto</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Seja um dos Primeiros!</h3>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Clientes atuais terão acesso antecipado e gratuito a todos os novos recursos quando forem lançados em 15
                de Dezembro de 2025.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <Badge variant="outline" className="text-sm py-2 px-4">
                  ✨ Acesso Antecipado Garantido
                </Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">
                  🎁 Sem Custo Adicional
                </Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">
                  🚀 Participe do Roadmap
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
