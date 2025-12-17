import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Code2,
  Database,
  Shield,
  FileText,
  GitBranch,
  Upload,
  Github,
  FolderOpen,
  BarChart3,
  Key,
  Webhook,
  ExternalLink,
} from "lucide-react"

export function SolutionSection() {
  const features = [
    {
      icon: Upload,
      title: "Upload de Repositórios ZIP",
      description:
        "Faça upload direto de arquivos ZIP contendo seu código-fonte para análise completa e automática de todos os arquivos do projeto.",
    },
    {
      icon: Github,
      title: "Múltiplas Fontes de Código",
      description:
        "Conecte repositórios do GitHub, faça upload de arquivos ZIP ou selecione pastas locais. Flexibilidade total para analisar seu código de qualquer fonte, sem limitações.",
    },
    {
      icon: FolderOpen,
      title: "Análise de Pasta Local",
      description:
        "Selecione pastas locais do seu computador para análise imediata, ideal para projetos em desenvolvimento ou testes rápidos.",
    },
    {
      icon: Code2,
      title: "Detecção Automática de CNPJ",
      description:
        "Identifica automaticamente todos os campos CNPJ no código, validações, máscaras, schemas de banco de dados e campos de entrada.",
    },
    {
      icon: Database,
      title: "Análise de Banco de Dados",
      description:
        "Detecta campos CNPJ em tabelas, constraints, índices e stored procedures, alertando sobre campos com tamanho insuficiente.",
    },
    {
      icon: FileText,
      title: "Relatórios Detalhados",
      description:
        "Gere relatórios completos em PDF, JSON ou Markdown com todos os findings, sugestões de correção e estimativa de horas de trabalho.",
    },
    {
      icon: BarChart3,
      title: "Estimativa de Esforço",
      description:
        "Calcule automaticamente as horas necessárias para implementar todas as mudanças, facilitando o planejamento e orçamento do projeto.",
    },
    {
      icon: Key,
      title: "API Keys para Integração",
      description:
        "Crie API keys para integrar o analisador com seus sistemas, CI/CD pipelines ou ferramentas de automação existentes.",
    },
    {
      icon: Webhook,
      title: "Webhooks e Notificações",
      description:
        "Configure webhooks para receber notificações automáticas quando análises forem concluídas, integrando com Slack, Discord ou email.",
    },
    {
      icon: Shield,
      title: "Sugestões de Correção",
      description:
        "Receba sugestões específicas e contextualizadas para cada tipo de campo CNPJ encontrado, acelerando a implementação das mudanças.",
    },
    {
      icon: GitBranch,
      title: "Versionamento Completo",
      description:
        "Mantenha histórico completo de todas as análises realizadas, permitindo comparações e acompanhamento da evolução do projeto.",
    },
    {
      icon: CheckCircle2,
      title: "Validação Contínua",
      description:
        "Execute análises periódicas para garantir que novos códigos também estejam em conformidade com o formato alfanumérico de CNPJ.",
    },
  ]

  const documents = [
    {
      title: "Apresentação do CNPJ Alfanumérico",
      description: "Documento oficial da Receita Federal.",
      link: "#",
    },
    {
      title: "Perguntas e Respostas - CNPJ Alfanumérico",
      description:
        "Documento oficial da Receita Federal com perguntas frequentes sobre a implementação do novo formato de CNPJ.",
      link: "#",
    },
    {
      title: "Cálculo do dígito verificador",
      description: "Documento oficial da Receita Federal explicando como calcular o dígito verificador do novo CNPJ.",
      link: "#",
    },
    {
      title: "Instrução normativa",
      description: "Documento oficial da Receita Federal com a instrução normativa.",
      link: "#",
    },
  ]

  return (
    <section id="solucao" className="py-16 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Sobre a <span className="text-primary">Solução</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
            Plataforma completa de análise e migração para o CNPJ Alfanumérico, desenvolvida especialmente para
            seguradoras, empresas de capitalização, saúde e qualquer organização que precise se adequar ao novo formato.
            Integração com múltiplos tipos de repositórios, análise automatizada e relatórios detalhados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Documentação Oficial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <a
                key={index}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
                  <span className="text-xs text-primary mt-2 inline-flex items-center gap-1">
                    Ver Documento <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-border bg-muted/50 p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Soluções Personalizadas</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto text-center leading-relaxed">
            Com <strong className="text-foreground">18 anos de experiência</strong> no mercado brasileiro, a
            WebNetSystems é especialista em{" "}
            <strong className="text-foreground">contabilidade, seguros, capitalização e saúde</strong>. Desenvolvemos
            soluções robustas e escaláveis que atendem desde pequenas empresas até grandes corporações, sempre com foco
            em <strong className="text-foreground">segurança, conformidade regulatória e eficiência operacional</strong>
            . Nossa equipe está pronta para criar a solução perfeita para seus desafios específicos de migração para o
            CNPJ Alfanumérico.
          </p>
        </div>

        <div className="mt-12 rounded-lg border border-primary/50 bg-primary/5 p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Por que o CNPJ Alfanumérico?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                Obrigatório em 2026
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O novo formato será obrigatório para todas as empresas brasileiras a partir de julho/2026, conforme
                determinação da Receita Federal através da Instrução Normativa RFB nº 2.229/2024.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                Conformidade Regulatória
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossa solução garante uma transição sem interrupções nos seus processos empresariais, garantindo
                conformidade total com as especificações da Receita Federal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                Mitigação de Riscos
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Garanta que sua empresa esteja em total conformidade, evitando problemas legais, reputacionais e
                operacionais durante o período de transição.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
