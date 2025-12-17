"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Building,
  FileCheck,
  ScanSearch,
  Users,
  ShoppingCart,
  UserCog,
  Workflow,
  Truck,
  Factory,
} from "lucide-react"

export function ProductsSection() {
  const aegisProducts = [
    {
      icon: FileText,
      name: "Aegis Contábil",
      description:
        "Sistema contábil completo e especializado para empresas dos setores de seguros, capitalização e saúde. Oferece módulos integrados para escrituração contábil, conciliação bancária, demonstrações financeiras e relatórios gerenciais, atendendo todas as exigências regulatórias específicas desses segmentos.",
      badge: "Contabilidade",
    },
    {
      icon: Building,
      name: "Aegis ERP",
      description:
        "ERP completo e robusto desenvolvido especificamente para seguradoras. Integra todos os processos operacionais, desde a emissão de apólices até a gestão de sinistros, passando por controle financeiro, gestão de corretores, resseguros e compliance. Solução end-to-end para operações de seguros.",
      badge: "Gestão Empresarial",
    },
    {
      icon: FileCheck,
      name: "Aegis Susep",
      description:
        "Solução completa para integração com a Superintendência de Seguros Privados (SUSEP). Contempla todos os módulos necessários para envio de informações regulatórias, incluindo todos os quadros estatísticos, demonstrações financeiras, planos de contas específicos e relatórios de compliance exigidos pelo órgão regulador.",
      badge: "Compliance",
    },
    {
      icon: ScanSearch,
      name: "Aegis CNPJ Alfanumérico",
      description:
        "Nossa mais nova solução para análise e migração de sistemas para o formato alfanumérico de CNPJ. Identifica automaticamente todos os pontos de impacto em seu código e banco de dados, fornece relatórios detalhados e estimativas precisas de esforço, garantindo uma transição segura e sem riscos para o novo formato que entra em vigor em julho de 2026.",
      badge: "Novo",
    },
  ]

  const talentProducts = [
    {
      icon: Users,
      name: "Talent Hub",
      description:
        "Plataforma completa de Recrutamento e Seleção com todos os módulos necessários para gestão de vagas, triagem de currículos, agendamento de entrevistas, avaliações técnicas e comportamentais, integração com portais de emprego e gestão completa do funil de contratação. Otimize seu processo seletivo do início ao fim.",
      category: "RH & Recrutamento",
    },
    {
      icon: ShoppingCart,
      name: "Talent Inova",
      description:
        "Sistema completo para empresas que vendem, independente do ramo de atividade. Inclui gestão de vendas, controle de estoque, emissão de notas fiscais, PDV (Ponto de Venda) com caixa integrado, gestão de clientes e fornecedores, relatórios gerenciais e muito mais. Solução versátil que se adapta a qualquer segmento comercial.",
      category: "Vendas & Comércio",
    },
    {
      icon: UserCog,
      name: "Talent Enterprise",
      description:
        "Sistema robusto e completo para Gestão de Pessoas e Recursos Humanos. Abrange folha de pagamento, controle de ponto, gestão de benefícios, avaliação de desempenho, plano de carreira, treinamentos, férias, admissão e demissão digital, e-Social, e todos os processos essenciais para uma gestão de RH moderna e eficiente.",
      category: "RH & Gestão",
    },
    {
      icon: Workflow,
      name: "Talent Process Controller",
      description:
        "Gerenciador avançado de processos empresariais (BPM) que permite modelar, automatizar, monitorar e otimizar fluxos de trabalho. Oferece controle total sobre processos organizacionais, com dashboards em tempo real, alertas automáticos, gestão de SLA, auditoria completa e integração com outros sistemas, aumentando produtividade e governança.",
      category: "Processos",
    },
    {
      icon: Truck,
      name: "Talent LMS",
      description:
        "Sistema de Gestão Logística (Logistics Management System) que unifica diversas ferramentas de gestão em um único software. Controla transporte, armazenagem, roteirização, rastreamento de cargas, gestão de frota, controle de entregas, custos logísticos e indicadores de performance, proporcionando visibilidade completa da cadeia de suprimentos.",
      category: "Logística",
    },
    {
      icon: Factory,
      name: "Talent Production",
      description:
        "Sistema especializado em processos de produção industrial. Permite controlar toda a linha de produção, identificar gargalos e falhas em tempo real, implementar soluções personalizadas para otimização, gestão de qualidade, controle de matéria-prima, rastreabilidade, OEE (Overall Equipment Effectiveness) e muito mais, aumentando eficiência, qualidade e produtividade da indústria.",
      category: "Indústria",
    },
  ]

  return (
    <section id="produtos" className="py-24 border-b border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Nosso <span className="text-primary">Portfólio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Soluções completas e especializadas para transformar a gestão do seu negócio, desenvolvidas com tecnologia
            de ponta e expertise de 18 anos de mercado.
          </p>
        </div>

        {/* Aegis Products */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Linha Aegis</h3>
              <p className="text-sm text-muted-foreground">Soluções para Contabilidade, Seguros e Compliance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aegisProducts.map((product, index) => (
              <Card key={index} className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <product.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={product.badge === "Novo" ? "default" : "secondary"}>{product.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{product.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Talent Products */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Linha Talent</h3>
              <p className="text-sm text-muted-foreground">Soluções para Gestão, RH, Vendas e Produção</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talentProducts.map((product, index) => (
              <Card key={index} className="border-border hover:border-chart-2/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 mb-3">
                    <product.icon className="h-6 w-6 text-chart-2" />
                  </div>
                  <Badge variant="outline" className="w-fit mb-2">
                    {product.category}
                  </Badge>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{product.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-3">Soluções Personalizadas</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Além de nosso portfólio completo, desenvolvemos soluções sob medida para atender necessidades
                específicas do seu negócio. Nossa equipe de especialistas está pronta para criar a solução perfeita para
                seus desafios.
              </p>
              <button
                onClick={() => document.getElementById("demonstracao")?.scrollIntoView({ behavior: "smooth" })}
                className="text-primary font-semibold hover:underline"
              >
                Fale com nossos especialistas →
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
