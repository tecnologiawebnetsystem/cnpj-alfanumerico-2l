import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Shield, Sparkles, Zap } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      number: "01",
      icon: DollarSign,
      title: "Redução de Custos",
      description: "Economia significativa com desenvolvimento e manutenção através de automação inteligente com IA.",
      color: "from-green-600 to-emerald-600",
      bgColor: "from-green-500/20 to-emerald-500/10",
    },
    {
      number: "02",
      icon: Shield,
      title: "Conformidade Total",
      description:
        "Solução 100% alinhada com as especificações da Receita Federal e Instrução Normativa RFB nº 2.229/2024.",
      color: "from-blue-600 to-cyan-600",
      bgColor: "from-blue-500/20 to-cyan-500/10",
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Inovação",
      description:
        "Uso de Inteligência Artificial para acelerar o processo de implementação e identificar pontos críticos.",
      color: "from-purple-600 to-pink-600",
      bgColor: "from-purple-500/20 to-pink-500/10",
    },
    {
      number: "04",
      icon: Zap,
      title: "Agilidade",
      description: "Adaptação rápida e eficiente com diagnóstico automatizado e codificação assistida por IA.",
      color: "from-orange-600 to-yellow-600",
      bgColor: "from-orange-500/20 to-yellow-500/10",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-background via-purple-500/5 to-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Benefícios da Nossa Solução
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Por que escolher a solução CNPJ Alfanumérico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <Card
              key={benefit.number}
              className={`border-2 hover:border-transparent transition-all hover:shadow-2xl hover:scale-105 bg-gradient-to-br ${benefit.bgColor}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <span
                    className={`text-6xl font-bold bg-gradient-to-br ${benefit.color} bg-clip-text text-transparent`}
                  >
                    {benefit.number}
                  </span>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.color} shadow-lg mt-2`}
                  >
                    <benefit.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
