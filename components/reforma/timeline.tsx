import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Rocket, ArrowRightLeft, CheckCircle } from "lucide-react"

const timelineData = [
  {
    period: "2026",
    title: "O ano de teste",
    icon: FlaskConical,
    badge: "Fase de adaptacao",
    color: "bg-primary/10 text-primary",
    description:
      "O processo comeca com um primeiro passo bem controlado. Em 2026, a CBS e o IBS entram em funcionamento apenas como \"amostra\", com aliquotas simbolicas.",
    details: [
      "Percentual muito reduzido: cerca de 0,9% da CBS e 0,1% do IBS",
      "Valor recolhido serve como base comparativa, compensado com PIS e COFINS",
      "Para contribuintes que cumprirem as obrigacoes corretamente, o montante sera desonerado",
      "2026 sera um ano de adaptacao, nao de custo adicional",
    ],
  },
  {
    period: "2027-2028",
    title: "Mudanca real comeca aqui",
    icon: Rocket,
    badge: "Cobranca efetiva",
    color: "bg-[#E67E22]/10 text-[#E67E22]",
    description:
      "A partir de 2027, a CBS passa a ser cobrada de fato, ja com reducao prevista na aliquota em comparacao ao modelo atual.",
    details: [
      "PIS e COFINS deixam de existir, dando espaco definitivo para a CBS",
      "IPI tem aliquotas zeradas para quase todos os produtos",
      "Excecao para produtos fabricados na Zona Franca de Manaus",
      "Criacao do Imposto Seletivo para itens que prejudiquem saude ou meio ambiente",
    ],
  },
  {
    period: "2029-2032",
    title: "A virada do ICMS e ISS para o IBS",
    icon: ArrowRightLeft,
    badge: "Transicao gradual",
    color: "bg-[#E67E22]/10 text-[#E67E22]",
    description:
      "O ICMS e o ISS serao gradualmente substituidos pelo IBS. A cada ano, o peso dos impostos antigos diminui:",
    details: [
      "2029: 10% IBS e 90% ICMS/ISS",
      "2030: 20% IBS e 80% ICMS/ISS",
      "2031: 30% IBS e 70% ICMS/ISS",
      "2032: 40% IBS e 60% ICMS/ISS",
    ],
  },
  {
    period: "2033",
    title: "O novo modelo assume totalmente",
    icon: CheckCircle,
    badge: "Modelo consolidado",
    color: "bg-[#27AE60]/10 text-[#27AE60]",
    description:
      "A partir de 2033, o Brasil conclui a jornada e passa a operar apenas com o novo sistema. O ICMS e o ISS sao extintos, e o IBS funciona sozinho.",
    details: [],
  },
]

export function Timeline() {
  return (
    <section id="transicao" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Como sera o periodo de transicao da Reforma Tributaria?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            A transicao para o novo sistema tributario nao sera feita de uma vez. O governo estruturou um periodo gradual
            para evitar rupturas que prejudiquem empresas, consumidores e a propria arrecadacao.
          </p>

          <div className="space-y-6">
            {timelineData.map((item, i) => (
              <Card key={i} className="p-6 lg:p-8 border-border bg-card relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />

                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex items-center gap-4 lg:min-w-[180px]">
                    <div className={`p-3 rounded-xl ${item.color.split(" ")[0]}`}>
                      <item.icon className={`h-6 w-6 ${item.color.split(" ")[1]}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{item.period}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.badge}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    {item.details.length > 0 && (
                      <ul className="space-y-2">
                        {item.details.map((detail, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
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
