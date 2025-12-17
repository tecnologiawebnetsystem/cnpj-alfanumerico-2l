import { Card, CardContent } from "@/components/ui/card"
import { Users, Award, TrendingUp, Sparkles } from "lucide-react"
import { Logo } from "./logo"

export function AboutSection() {
  return (
    <section id="sobre" className="py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Quem <span className="text-primary">Somos</span>
          </h2>
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-auto" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Sistema especializado em soluções para análise e conversão de campos CNPJ para o novo formato alfanumérico,
            atendendo empresas de contabilidade, seguros, capitalização e saúde.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-border">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-2">100%</p>
              <p className="text-sm text-muted-foreground">Análises Automatizadas</p>
            </CardContent>
          </Card>

          <Card className="text-center border-border">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-2">500+</p>
              <p className="text-sm text-muted-foreground">Clientes ativos</p>
            </CardContent>
          </Card>

          <Card className="text-center border-border">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-7 w-7 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-2">10+</p>
              <p className="text-sm text-muted-foreground">Produtos especializados</p>
            </CardContent>
          </Card>

          <Card className="text-center border-border">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-2">99.9%</p>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Nossa Solução</h3>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  O <strong className="text-foreground">CNPJ Alfanumérico</strong> é uma solução completa desenvolvida
                  para facilitar a transição dos sistemas brasileiros para o novo formato de CNPJ estabelecido pela
                  Receita Federal. Nossa tecnologia utiliza{" "}
                  <strong className="text-foreground">Inteligência Artificial</strong> para identificar automaticamente
                  todos os pontos que necessitam de atualização.
                </p>
                <p>
                  Desenvolvemos uma plataforma robusta e escalável que atende desde pequenas empresas até grandes
                  corporações, sempre com foco em{" "}
                  <strong className="text-foreground">
                    segurança, conformidade regulatória e eficiência operacional
                  </strong>
                  . Nossa tecnologia compreende profundamente os desafios e necessidades específicas da mudança do CNPJ
                  para formato alfanumérico.
                </p>
                <p>
                  A solução oferece análise completa de código-fonte e banco de dados, gerando relatórios detalhados com{" "}
                  <strong className="text-foreground">
                    estimativas precisas de horas e sugestões de implementação
                  </strong>
                  , garantindo uma transição suave e segura para o novo formato obrigatório a partir de 2026.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
