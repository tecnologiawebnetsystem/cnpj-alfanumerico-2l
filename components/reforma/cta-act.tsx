import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, FileCheck, BarChart3, Boxes, Gauge } from "lucide-react"
import Link from "next/link"

export function CTAAct() {
  return (
    <section id="act-digital" className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
              A reforma tributaria esta chegando e a ACT Digital ajuda voce a passar por ela com seguranca
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              A reforma tributaria pode assustar, mas voce nao precisa enfrentar essa transicao sozinho. Com as solucoes
              da ACT Digital, a adaptacao se torna muito mais simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: FileCheck,
                title: "Emissao de notas fiscais",
                description:
                  "Emissao automatica e segura, reduzindo rejeicoes e garantindo que cada documento saia dentro das regras.",
              },
              {
                icon: Boxes,
                title: "Cadastro centralizado",
                description:
                  "Produtos, clientes e fornecedores organizados e atualizados, essencial quando CBS e IBS exigem mais precisao.",
              },
              {
                icon: BarChart3,
                title: "Gestao financeira integrada",
                description:
                  "Clareza total sobre fluxo de caixa, margens e despesas, permitindo ajustes rapidos conforme novas aliquotas.",
              },
              {
                icon: Shield,
                title: "Controle das vendas",
                description:
                  "Operacao fluida no fisico, online ou nos dois. Com recursos multicanal e integracoes com marketplaces.",
              },
              {
                icon: Gauge,
                title: "Dashboards inteligentes",
                description:
                  "Desempenho do negocio em tempo real, dando seguranca para tomar decisoes estrategicas.",
              },
              {
                icon: ArrowRight,
                title: "Ferramentas de migracao",
                description:
                  "CNPJ Detector e outras solucoes para garantir que seus sistemas estejam prontos para a transicao.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Com a ACT Digital, voce ganha tranquilidade para focar no crescimento enquanto nossas solucoes cuidam da
              complexidade tributaria. Explore nossas ferramentas e veja como sua rotina pode ficar muito mais leve.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
