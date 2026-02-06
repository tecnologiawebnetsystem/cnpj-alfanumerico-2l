import { Card } from "@/components/ui/card"
import {
  AlertTriangle,
  FileText,
  ArrowRightLeft,
  Building2,
  Landmark,
  TrendingDown,
  CheckCircle,
  XCircle,
} from "lucide-react"

export function PorQueReforma() {
  return (
    <section id="por-que" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            Por que a reforma tributaria era tao necessaria?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Antes de conhecer os novos impostos, e importante olhar para o contexto que levou o pais a uma mudanca tao
            profunda. O sistema tributario brasileiro sempre foi considerado um dos mais complexos do mundo, e isso nao e
            exagero.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: AlertTriangle,
                text: "Regras diferentes em cada estado",
              },
              {
                icon: FileText,
                text: "Impostos que variam conforme o produto",
              },
              {
                icon: TrendingDown,
                text: "Aliquotas caras e dificeis de entender",
              },
              {
                icon: ArrowRightLeft,
                text: "Dificuldade de calcular tributos corretamente, especialmente em e-commerces que vendem para varios estados",
              },
            ].map((item, i) => (
              <Card key={i} className="flex items-start gap-4 p-5 border-border bg-card">
                <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                  <item.icon className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-muted-foreground leading-relaxed">
            O resultado e um ambiente cheio de inseguranca e custos operacionais elevados. E nesse cenario que a reforma
            tributaria 2026 comeca a se firmar como uma das maiores mudancas da historia economica recente.
          </p>
        </div>
      </div>
    </section>
  )
}

export function OQueMuda() {
  return (
    <section id="o-que-muda" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            O que muda com a reforma tributaria?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            A reforma tributaria 2026 marca o inicio oficial de uma mudanca estruturante no sistema brasileiro. Ela cria
            um modelo baseado no{" "}
            <span className="font-semibold text-foreground">IVA (Imposto sobre Valor Agregado)</span>, que ja e usado em
            diversos paises, com o objetivo de simplificar regras, melhorar a transparencia e reduzir distorcoes.
          </p>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Mas se a proposta e simplificar, por que tantos empreendedores estao preocupados? Porque a simplificacao so
            acontece de forma plena apos o periodo de transicao. Ate la, teremos uma especie de &quot;duplo sistema&quot;: os
            impostos antigos ainda existem, enquanto os novos comecam a valer de maneira gradual.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Mais responsabilidade operacional",
              "Necessidade de acompanhar e de se adaptar a novas regras",
              "Maior risco de erros em notas fiscais",
              "Impacto direto no fluxo de caixa",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function NovosImpostos() {
  return (
    <section id="novos-impostos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-balance">
            Entendendo os novos impostos: IBS e CBS
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CBS */}
            <Card className="p-8 border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Landmark className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">CBS</h3>
                  <p className="text-sm text-muted-foreground">Contribuicao sobre Bens e Servicos</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A CBS sera um tributo federal, com objetivo de substituir as contribuicoes atuais de PIS e COFINS.
              </p>
              <ul className="space-y-3">
                {[
                  "Incidencia ampla sobre bens e servicos, sem distincao por setor",
                  "Modelo semelhante a um IVA, com credito financeiro para evitar cumulatividade",
                  "Na fase de testes (2026), a aliquota sera de apenas 0,9%",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-medium text-primary">Substitui: PIS e COFINS</p>
              </div>
            </Card>

            {/* IBS */}
            <Card className="p-8 border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">IBS</h3>
                  <p className="text-sm text-muted-foreground">Imposto sobre Bens e Servicos</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Ja o IBS corresponde as competencias estaduais e municipais. Sera devido nas operacoes entre bens e
                servicos que envolvem circulacao.
              </p>
              <ul className="space-y-3">
                {[
                  "Incide sobre bens materiais, direitos e servicos",
                  "Sera devido em todas as etapas de producao e comercializacao",
                  "Tributo cobrado no destino, onde o consumidor final esta",
                  "Imposto nao cumulativo",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-medium text-primary">Substitui: ICMS e ISS</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
