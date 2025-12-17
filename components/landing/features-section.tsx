import {
  Sparkles,
  Code2,
  GitBranch,
  Database,
  Shield,
  LifeBuoy,
  FileText,
  Clock,
  Zap,
  Code,
  Globe,
  Lock,
  GitPullRequest,
} from "lucide-react"
import { Card } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "Diagnóstico Preciso com IA",
      description:
        "Inteligência Artificial identifica automaticamente todos os pontos de alteração necessários em seus sistemas, economizando tempo e recursos",
      gradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Code2,
      title: "Codificação Automatizada",
      description:
        "Redução drástica do tempo e custo de desenvolvimento com a codificação assistida por IA, gerando código compatível com o novo formato",
      gradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      icon: GitBranch,
      title: "Integração com Repositórios",
      description:
        "Integração completa com GitHub, GitLab, Bitbucket e outros repositórios, ou análise local via upload de código para facilitar o processo de implementação",
      gradient: "from-cyan-500/10 to-teal-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      icon: GitPullRequest,
      title: "Integração com Azure DevOps Tasks",
      description:
        "Sincronização bidirecional automática com Azure DevOps Work Items. Tarefas criadas no sistema aparecem automaticamente no Azure Boards e vice-versa, com rastreabilidade completa",
      gradient: "from-blue-500/10 to-indigo-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Database,
      title: "Sistemas Legados",
      description:
        "Integração com qualquer sistema legado, independente da tecnologia utilizada, garantindo compatibilidade total",
      gradient: "from-blue-500/10 to-purple-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Shield,
      title: "Testes e Validações",
      description:
        "Testes e validações completas para garantir que seu sistema funcione perfeitamente com o novo formato de CNPJ",
      gradient: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/30",
    },
    {
      icon: LifeBuoy,
      title: "Suporte Pós-Implantação",
      description:
        "Treinamento da equipe e suporte contínuo para garantir que você saiba usar a IA para manter seus sistemas atualizados",
      gradient: "from-orange-500/10 to-amber-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      icon: FileText,
      title: "Análise de Código e Banco de Dados",
      description:
        "Análise automatizada de código e banco de dados para identificar todos os campos CNPJ que precisam ser atualizados",
      gradient: "from-pink-500/10 to-rose-500/10",
      borderColor: "border-pink-500/30",
    },
    {
      icon: FileText,
      title: "Relatórios Detalhados",
      description:
        "Relatórios completos em PDF, JSON e Markdown com sugestões de correção e melhores práticas de implementação",
      gradient: "from-indigo-500/10 to-blue-500/10",
      borderColor: "border-indigo-500/30",
    },
    {
      icon: Clock,
      title: "Estimativa de Trabalho",
      description:
        "Estimativa precisa de horas de trabalho para implementação das mudanças, ajudando no planejamento e orçamento do projeto",
      gradient: "from-violet-500/10 to-purple-500/10",
      borderColor: "border-violet-500/30",
    },
    {
      icon: Zap,
      title: "Alta Performance",
      description: "Validação otimizada com cache e processamento eficiente para milhares de requisições",
      gradient: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      icon: Code,
      title: "Múltiplas Linguagens",
      description: "Exemplos prontos em JavaScript, Python, Java, PHP, C#, Go, Flutter, React, Angular, Vue e ASP.NET",
      gradient: "from-teal-500/10 to-cyan-500/10",
      borderColor: "border-teal-500/30",
    },
    {
      icon: Globe,
      title: "API REST",
      description: "Integração simples via API REST com documentação completa e exemplos de uso",
      gradient: "from-sky-500/10 to-blue-500/10",
      borderColor: "border-sky-500/30",
    },
    {
      icon: Database,
      title: "Suporte a Bancos de Dados",
      description: "Scripts de migração prontos para SQL Server, Oracle, PostgreSQL e MySQL",
      gradient: "from-emerald-500/10 to-green-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: Lock,
      title: "Segurança Garantida",
      description:
        "Validação de dígitos verificadores com algoritmo de módulo 36 conforme especificação oficial da Receita Federal",
      gradient: "from-red-500/10 to-pink-500/10",
      borderColor: "border-red-500/30",
    },
    {
      icon: Clock,
      title: "Pronto para 2026",
      description: "Sistema totalmente preparado para a obrigatoriedade do CNPJ alfanumérico em julho de 2026",
      gradient: "from-blue-500/10 to-purple-500/10",
      borderColor: "border-blue-500/30",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Por que escolher a solução da ACT Digital?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Criada pela <span className="font-bold text-primary">ACT Digital</span>, líder em transformação digital há
            mais de 13 anos com mais de 100 clientes no Brasil e presença em 12 países
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`p-6 text-center hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/15`}
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
