import { Card } from "@/components/ui/card"
import {
  ClipboardList,
  Monitor,
  BookOpen,
  Wallet,
  Settings,
  CheckCircle,
} from "lucide-react"

const steps = [
  {
    icon: ClipboardList,
    title: "Organize o cadastro de produtos",
    description:
      "Revise NCM, descricoes, categorias e particularidades de cada item do seu catalogo. Com a CBS e o IBS exigindo informacoes mais detalhadas, um cadastro impreciso pode gerar notas rejeitadas e aliquotas incorretas.",
  },
  {
    icon: Monitor,
    title: "Digitalize o maximo possivel",
    description:
      "A convivencia entre impostos antigos e novos exigira calculos diferentes, campos adicionais nas notas fiscais e ajustes constantes. A digitalizacao permite padronizar processos e reduzir falhas humanas.",
  },
  {
    icon: BookOpen,
    title: "Busque informacao confiavel e atualizada",
    description:
      "As regras da reforma tributaria serao detalhadas ao longo dos proximos anos. Acompanhar fontes oficiais, participar de webinars e manter-se atento as atualizacoes e essencial.",
  },
  {
    icon: Wallet,
    title: "Reveja seu fluxo de caixa e planejamento",
    description:
      "Com a transicao tributaria trazendo novas aliquotas, regras e prazos, acompanhar de perto o fluxo de caixa e fundamental para evitar surpresas e reorganizar precos.",
  },
  {
    icon: Settings,
    title: "Adote um sistema preparado para a transicao",
    description:
      "Escolher um sistema capaz de acompanhar a transicao tributaria e um dos passos mais importantes. Automatize calculos, interprete as novas regras e atualize aliquotas sem esforco.",
  },
]

export function PrepareSection() {
  return (
    <section id="preparar" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Como preparar a sua empresa para a Reforma Tributaria 2026?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Embora a reforma tributaria avance de forma gradual, quem comeca a se preparar desde ja sente muito menos o
            impacto das mudancas. A organizacao antecipada faz toda a diferenca.
          </p>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <Card key={i} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-2xl font-bold text-primary/30">{String(i + 1).padStart(2, "0")}</span>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function NaPratica() {
  return (
    <section id="na-pratica" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            Na pratica: o que os novos impostos significam para voce?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Que seus sistemas, integracoes e processos internos precisam estar preparados para:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Interpretar e aplicar aliquotas diferentes",
              "Lidar com calculos duplos durante a transicao",
              "Recolher impostos antigos e novos simultaneamente",
              "Entender regras especificas da sua operacao",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-xl bg-card border border-border">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-foreground">{item}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-muted-foreground leading-relaxed">
            E como essas mudancas impactam diretamente a emissao de notas fiscais, quem nao estiver com um sistema
            atualizado corre grande risco de ter notas rejeitadas, pagar a mais (ou a menos) e sofrer autuacoes.
          </p>
        </div>
      </div>
    </section>
  )
}
