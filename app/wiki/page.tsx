"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Users,
  Code,
  Database,
  GitBranch,
  BarChart3,
  FileText,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Code2,
  ExternalLink,
  Download,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react" // Added for chatbot state
import { Input } from "@/components/ui/input" // Added for chatbot input

export default function WikiPage() {
  const profiles = [
    {
      role: "Super Admin",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      description: "Controle absoluto do sistema com acesso a todas as funcionalidades administrativas",
      permissions: [
        "Gerenciar todos os clientes e suas licenças",
        "Criar, editar e remover usuários de qualquer tipo",
        "Visualizar todos os repositórios e análises",
        "Gerar relatórios consolidados de todos os clientes",
        "Configurar integrações e sistema",
        "Acessar logs de auditoria completos",
        "Gerenciar permissões e roles",
      ],
      features: [
        {
          title: "Dashboard Global",
          description: "Visão consolidada de todos os clientes, análises e métricas do sistema",
        },
        {
          title: "Gerenciamento de Clientes",
          description: "CRUD completo de clientes com controle de CNPJ, email, status e informações",
        },
        {
          title: "Controle de Licenças",
          description: "Ativar, desativar e gerenciar licenças de acesso de cada cliente",
        },
        {
          title: "Gerenciamento de Usuários",
          description: "Criar admins de cliente e devs, associar a clientes específicos",
        },
        {
          title: "Relatórios Avançados",
          description: "Gerar relatórios de clientes, licenças, análises e financeiro em PDF/Excel",
        },
        {
          title: "Configurações do Sistema",
          description: "Ajustar parâmetros globais, integrações e variáveis de ambiente",
        },
      ],
    },
    {
      role: "Admin Cliente",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: "Gerencia a equipe de desenvolvedores e repositórios do seu cliente",
      permissions: [
        "Visualizar dados apenas do seu cliente",
        "Gerenciar desenvolvedores (devs) do cliente",
        "Conectar e gerenciar repositórios Git",
        "Criar e gerenciar conexões de banco de dados",
        "Executar análises de CNPJ em repositórios",
        "Criar e atribuir tasks para devs",
        "Visualizar relatórios e análises do cliente",
        "Gerenciar sprints e metodologia ágil",
      ],
      features: [
        {
          title: "Dashboard do Cliente",
          description: "Visão geral de repositórios, análises, tasks e métricas do cliente",
        },
        {
          title: "Gerenciamento de Devs",
          description: "Criar, editar e remover desenvolvedores da equipe",
        },
        {
          title: "Repositórios Git",
          description: "Conectar GitHub, visualizar repos e executar análises automáticas",
        },
        {
          title: "Análise de Banco de Dados",
          description: "Conectar bancos (MySQL, PostgreSQL, Oracle) e analisar campos CNPJ",
        },
        {
          title: "Gestão de Tasks",
          description: "Criar tasks, atribuir para devs, acompanhar progresso com Kanban",
        },
        {
          title: "Relatórios Personalizados",
          description: "Gerar relatórios de análises por repositório ou desenvolvedor",
        },
        {
          title: "Sistema de Sprints",
          description: "Criar sprints, daily standups e retrospectivas da equipe",
        },
        {
          title: "Gamificação",
          description: "Acompanhar pontuação, conquistas e ranking dos desenvolvedores",
        },
      ],
    },
    {
      role: "Desenvolvedor (Dev)",
      icon: Code,
      color: "from-green-500 to-emerald-500",
      description: "Executa tarefas usando board Kanban estilo Jira",
      permissions: [
        "Visualizar tasks atribuídas a ele no board Kanban",
        "Mover tasks entre Pendentes, Em Desenvolvimento e Finalizadas",
        "Adicionar commit hash e número do PR ao finalizar task",
        "Visualizar detalhes completos de cada task",
        "Comentar em tasks e análises",
        "Visualizar suas próprias métricas e pontos",
      ],
      features: [
        {
          title: "Board Kanban Estilo Jira",
          description:
            "Interface visual com 3 colunas: Pendentes, Em Desenvolvimento e Finalizadas para gerenciar tasks",
        },
        {
          title: "Mover Tasks com Um Clique",
          description: "Botão 'Iniciar Desenvolvimento' nas tasks pendentes e 'Finalizar Tarefa' nas em progresso",
        },
        {
          title: "Commit e PR Obrigatórios",
          description:
            "Ao finalizar, deve informar o commit hash (ex: a1b2c3d4) e número do PR (ex: 123) para documentação",
        },
        {
          title: "Dashboard de Métricas",
          description:
            "Cards com contadores de tasks: Pendentes (laranja), Em Desenvolvimento (azul), Finalizadas (verde)",
        },
        {
          title: "Detalhes da Task",
          description: "Ver título, descrição completa, prioridade, data de criação e histórico de mudanças",
        },
        {
          title: "Filtros por Status",
          description: "Visualizar todas as tasks ou filtrar por status específico no board",
        },
      ],
    },
  ]

  const systemFeatures = [
    {
      icon: Database,
      title: "Análise de Banco de Dados",
      description:
        "Conecta em múltiplos bancos (MySQL, PostgreSQL, Oracle) e identifica automaticamente campos CNPJ que precisam ser convertidos para alfanumérico.",
    },
    {
      icon: GitBranch,
      title: "Integração Git",
      description:
        "Conecta com GitHub e Azure DevOps para analisar código-fonte, identificar validações de CNPJ e gerar tasks automáticas de conversão.",
    },
    {
      icon: Code,
      title: "Análise de Código",
      description: "Usa IA para escanear código em múltiplas linguagens, detectar uso de CNPJ e sugerir alterações.",
    },
    {
      icon: Code,
      title: "Editor Monaco Inline",
      description:
        "Edite o código diretamente no browser antes de aplicar correções, com diff visual e validação de sintaxe.",
    },
    {
      icon: GitBranch,
      title: "Auto-Fix com Git",
      description: "Sistema cria automaticamente branches, commits e Pull Requests com as correções sugeridas.",
    },
    {
      icon: FileText,
      title: "Relatórios Detalhados Excel/PDF",
      description: "Relatórios completos com código antes/depois, contexto e estatísticas visuais em múltiplas abas.",
    },
    {
      icon: BarChart3,
      title: "Integração Azure DevOps",
      description:
        "Sincronize tarefas com Azure DevOps Boards, criando Work Items automaticamente com todas as informações.",
    },
    {
      icon: Users,
      title: "Chatbot Inteligente",
      description:
        "Assistente IA que responde perguntas sobre tarefas, repositórios e análises em tempo real com detecção de intenção.",
    },
    {
      icon: CheckCircle,
      title: "Sistema de Notificações",
      description:
        "Modais profissionais substituindo todos os alerts nativos, com tipos success, error, warning e info.",
    },
    {
      icon: Database,
      title: "Limpeza de Tarefas",
      description:
        "Exclua todas as tarefas de um desenvolvedor ou de todo o cliente com confirmação e preview de impacto.",
    },
    {
      icon: GitBranch,
      title: "Gestão de Projetos Azure",
      description:
        "Suporte para múltiplos projetos por conta Azure DevOps, permitindo organização granular de repositórios.",
    },
  ]

  // CHATBOT STATE AND FUNCTIONS
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/wiki/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Documentação do Sistema
            </h1>
            <p className="text-lg text-muted-foreground">CNPJ Alfanumérico - Guia Completo</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-8">
            {" "}
            {/* Adjusted grid-cols to accommodate new tab */}
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="profiles">Perfis e Menus</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="workflow">Fluxo de Trabalho</TabsTrigger>
            <TabsTrigger value="analysis-guide">Guia de Análise</TabsTrigger>
            <TabsTrigger value="beginner-guide">Guia Iniciantes</TabsTrigger> {/* Added new tab */}
            <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
            <TabsTrigger value="technical">Documentação Técnica</TabsTrigger>
            <TabsTrigger value="documentacao">📚 Documentação</TabsTrigger> {/* Added new tab */}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Sistema</CardTitle>
                <CardDescription>O que é e para que serve o CNPJ Alfanumérico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  O sistema <strong>CNPJ Alfanumérico</strong> é uma solução inteligente desenvolvida para facilitar a
                  transição de campos CNPJ numéricos para o novo formato alfanumérico estabelecido pela Receita Federal
                  do Brasil.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Sobre a Mudança do CNPJ:</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A partir de 2026, o formato de CNPJ passará de 14 dígitos numéricos para 18 caracteres
                    alfanuméricos. Todos os sistemas que armazenam ou validam CNPJ precisam ser atualizados. Este
                    sistema automatiza a identificação de onde essas mudanças são necessárias (código-fonte, banco de
                    dados, APIs) e gerencia todo o processo de conversão.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Principais Funcionalidades:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {systemFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg border bg-card">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-8 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfis do Sistema e Seus Menus</CardTitle>
                <CardDescription>
                  Detalhamento completo de cada perfil, seus acessos e funcionalidades por menu
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Super Admin */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Shield className="h-9 w-9 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">Super Admin</CardTitle>
                    <CardDescription>Controle total do sistema com acesso irrestrito</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Painel Admin</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gerenciamento completo de clientes e usuários do sistema
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Clientes
                        </Badge>
                        <span className="text-sm">CRUD completo, ativar/desativar licenças, vincular CNPJ</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Usuários
                        </Badge>
                        <span className="text-sm">Criar admins de cliente e desenvolvedores, associar a clientes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Análises
                        </Badge>
                        <span className="text-sm">Visualizar todas as análises de todos os clientes com filtros</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Limpeza
                        </Badge>
                        <span className="text-sm">Sistema de limpeza de dados com preview de impacto</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Visão Geral</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Dashboard consolidado com métricas de todo o sistema
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Métricas
                        </Badge>
                        <span className="text-sm">Total de clientes ativos, análises concluídas, tarefas globais</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Gráficos
                        </Badge>
                        <span className="text-sm">Evolução temporal de análises, distribuição por cliente</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Configurações</h4>
                    <p className="text-sm text-muted-foreground mb-3">Ajustes globais e integrações do sistema</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Sistema
                        </Badge>
                        <span className="text-sm">Variáveis de ambiente, parâmetros de análise, rate limits</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Integrações
                        </Badge>
                        <span className="text-sm">GitHub, Azure DevOps, bancos de dados, WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Cliente */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Users className="h-9 w-9 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-blue-700 dark:text-blue-300">Admin Cliente</CardTitle>
                    <CardDescription>Gerencia equipe e análises do cliente</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Visão Geral</h4>
                    <p className="text-sm text-muted-foreground mb-3">Dashboard do cliente com métricas e resumos</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Cards
                        </Badge>
                        <span className="text-sm">Total de análises, concluídas, em andamento, desenvolvedores</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Abas
                        </Badge>
                        <span className="text-sm">Análises, Tarefas, Desenvolvedores, Relatórios, Configurações</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Aba: Análises</h4>
                    <p className="text-sm text-muted-foreground mb-3">Gerenciar análises de repositórios</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Nova Análise
                        </Badge>
                        <span className="text-sm">Botão para criar análise, selecionar repos Azure/GitHub</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Histórico
                        </Badge>
                        <span className="text-sm">Grid com todas as análises, status, progresso em tempo real</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Ações
                        </Badge>
                        <span className="text-sm">Exibir detalhes (desabilitado durante processamento), deletar</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Filtros
                        </Badge>
                        <span className="text-sm">Buscar por repositório, conta ou provedor</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Aba: Tarefas</h4>
                    <p className="text-sm text-muted-foreground mb-3">Criar e gerenciar tarefas para desenvolvedores</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Nova Tarefa
                        </Badge>
                        <span className="text-sm">Criar tarefa com título, descrição, desenvolvedor</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Grid
                        </Badge>
                        <span className="text-sm">Visualizar todas as tarefas com status, desenvolvedor atribuído</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Azure DevOps
                        </Badge>
                        <span className="text-sm">Botão para sincronizar tarefas com Azure DevOps Boards</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Atribuir Dev
                        </Badge>
                        <span className="text-sm">Combo box para selecionar desenvolvedor responsável</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Filtros
                        </Badge>
                        <span className="text-sm">Filtrar por status, desenvolvedor, prioridade</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Aba: Desenvolvedores</h4>
                    <p className="text-sm text-muted-foreground mb-3">Gerenciar equipe de desenvolvimento</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Novo DEV
                        </Badge>
                        <span className="text-sm">Criar desenvolvedor com nome, email, senha inicial</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Métricas
                        </Badge>
                        <span className="text-sm">Tarefas atribuídas, concluídas, status (Ativo/Inativo)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Ações
                        </Badge>
                        <span className="text-sm">Limpar tarefas do DEV, editar, ativar/desativar</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Auto-refresh
                        </Badge>
                        <span className="text-sm">Atualiza automaticamente a cada 10 segundos</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-cyan-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Aba: Relatórios</h4>
                    <p className="text-sm text-muted-foreground mb-3">Visualizar e exportar relatórios de análises</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Dashboard
                        </Badge>
                        <span className="text-sm">
                          Gráficos interativos, evolução temporal, distribuição por projeto
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Comparação
                        </Badge>
                        <span className="text-sm">
                          Comparar duas análises (antes vs depois), ver ocorrências resolvidas
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Agendamento
                        </Badge>
                        <span className="text-sm">Agendar envio automático de relatórios por email</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Exportação
                        </Badge>
                        <span className="text-sm">Baixar relatórios em PDF, Excel/CSV, JSON ou ZIP completo</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Aba: Configurações</h4>
                    <p className="text-sm text-muted-foreground mb-3">Configurar conta do cliente e integrações</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Conta Azure
                        </Badge>
                        <span className="text-sm">Adicionar/remover contas Azure DevOps e GitHub</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Campos CNPJ
                        </Badge>
                        <span className="text-sm">Definir campos customizados de CNPJ para análise</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Extensões
                        </Badge>
                        <span className="text-sm">Configurar extensões de arquivos para análise de código</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          WhatsApp
                        </Badge>
                        <span className="text-sm">Configurar notificações via WhatsApp (requer API contratada)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desenvolvedor */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Code className="h-9 w-9 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-green-700 dark:text-green-300">Desenvolvedor (DEV)</CardTitle>
                    <CardDescription>Executa tarefas através do Kanban board</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Kanban Board de Tarefas</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Board estilo Jira com 3 colunas para gerenciar tasks
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 mt-0.5">
                          Pendente
                        </Badge>
                        <span className="text-sm">Tarefas aguardando início, cor amarela/âmbar</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 mt-0.5">
                          Em Desenvolvimento
                        </Badge>
                        <span className="text-sm">Tarefas em progresso, cor azul/índigo</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 mt-0.5">
                          Concluído
                        </Badge>
                        <span className="text-sm">Tarefas finalizadas, cor verde/esmeralda</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Drag & Drop
                        </Badge>
                        <span className="text-sm">Arrastar tarefas entre colunas para mudar status</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Botões Rápidos
                        </Badge>
                        <span className="text-sm">Iniciar Desenvolvimento e Finalizar Tarefa com um clique</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Cards de Tarefa</h4>
                    <p className="text-sm text-muted-foreground mb-3">Informações detalhadas em cada card</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Título
                        </Badge>
                        <span className="text-sm">Nome da tarefa e identificador único</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Descrição
                        </Badge>
                        <span className="text-sm">Detalhes completos do que deve ser feito</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Prioridade
                        </Badge>
                        <span className="text-sm">Badge colorido indicando urgência (Baixa, Média, Alta, Crítica)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Data
                        </Badge>
                        <span className="text-sm">Data de criação da tarefa</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Finalização de Tarefa</h4>
                    <p className="text-sm text-muted-foreground mb-3">Informar commit e PR ao concluir</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Commit Hash
                        </Badge>
                        <span className="text-sm">Campo obrigatório para informar hash do commit (ex: a1b2c3d4)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          PR Number
                        </Badge>
                        <span className="text-sm">Campo obrigatório para número do Pull Request (ex: 123)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Validação
                        </Badge>
                        <span className="text-sm">Sistema valida formato antes de permitir conclusão</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-2">Dashboard de Métricas</h4>
                    <p className="text-sm text-muted-foreground mb-3">Cards com contadores visuais no topo</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 mt-0.5">
                          Pendente
                        </Badge>
                        <span className="text-sm">Número de tarefas aguardando início</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 mt-0.5">
                          Em Progresso
                        </Badge>
                        <span className="text-sm">Número de tarefas sendo desenvolvidas</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 mt-0.5">
                          Concluídas
                        </Badge>
                        <span className="text-sm">Número de tarefas finalizadas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Módulos do Sistema</CardTitle>
                <CardDescription>Todas as funcionalidades disponíveis na plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    module: "Análise de Repositórios",
                    description: "Escaneia código-fonte em busca de uso de CNPJ",
                    features: [
                      "Suporte a múltiplas linguagens",
                      "Detecção de validações",
                      "Identificação de campos",
                      "Estimativa de horas",
                    ],
                  },
                  {
                    module: "Análise de Banco de Dados",
                    description: "Conecta em bancos e identifica campos CNPJ",
                    features: [
                      "MySQL, PostgreSQL, Oracle, SQL Server",
                      "Scan automático de tabelas",
                      "Identifica tipo e tamanho",
                      "Verifica índices",
                    ],
                  },
                  {
                    module: "Gestão de Tasks",
                    description: "Sistema completo de gerenciamento de tarefas",
                    features: ["Kanban board", "Atribuição de devs", "Story points", "Critérios de aceitação"],
                  },
                  {
                    module: "Sistema de Sprints",
                    description: "Metodologia ágil com sprints e standups",
                    features: ["Criação de sprints", "Daily standups", "Retrospectivas", "Velocity tracking"],
                  },
                  {
                    module: "Relatórios",
                    description: "Geração de relatórios detalhados",
                    features: [
                      "Exportação PDF/Excel",
                      "Filtros personalizados",
                      "Relatórios por cliente",
                      "Análise financeira",
                    ],
                  },
                  {
                    module: "Gamificação",
                    description: "Sistema de pontos e conquistas",
                    features: ["Pontos por task", "Sistema de níveis", "Conquistas e badges", "Ranking de equipe"],
                  },
                ].map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.module}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Trabalho Completo - Ponta a Ponta</CardTitle>
                <CardDescription>Processo detalhado desde a análise até a conclusão das tarefas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Admin Cliente: Realizar Análise do Repositório",
                      description:
                        "No dashboard, aba Análises, execute a análise completa do repositório GitHub ou Azure DevOps para identificar campos CNPJ",
                      actor: "Admin Cliente",
                      details: [
                        "Selecione repositórios conectados",
                        "Escolha o analisador de código apropriado",
                        "Acompanhe progresso em tempo real (0% → 100%)",
                      ],
                    },
                    {
                      step: "2",
                      title: "Sistema: Gerar Relatório Automático",
                      description:
                        "Após análise, sistema gera relatório completo mostrando todos os repositórios, arquivos, linhas e alterações necessárias",
                      actor: "Sistema",
                      details: [
                        "Lista repositórios que devem sofrer alteração",
                        "Mostra arquivos específicos e linhas exatas",
                        "Sugere código corrigido para cada ocorrência",
                        "Estima esforço em horas",
                      ],
                    },
                    {
                      step: "3",
                      title: "Admin Cliente: Criar e Atribuir Tarefas",
                      description: "Com base no relatório, crie tarefas e atribua para desenvolvedores da equipe",
                      actor: "Admin Cliente",
                      details: [
                        "Crie tasks manualmente ou via relatório",
                        "Atribua desenvolvedor responsável",
                        "Defina prioridade (baixa, média, alta, crítica)",
                        "Adicione observações e contexto",
                      ],
                    },
                    {
                      step: "4",
                      title: "Admin Cliente: Sincronizar com Azure DevOps (Opcional)",
                      description: "Envie as tarefas para Azure DevOps Boards automaticamente para criar Work Items",
                      actor: "Admin Cliente",
                      details: [
                        "Selecione conta e projeto Azure DevOps",
                        "Sistema cria Work Items com título, descrição e diff",
                        "URL do Work Item é salva na tarefa",
                        "Sincronização bidirecional de status",
                      ],
                    },
                    {
                      step: "5",
                      title: "Desenvolvedor: Visualizar Tarefa no Dashboard",
                      description: "Desenvolvedor acessa seu dashboard e vê tarefa atribuída no board Kanban",
                      actor: "Dev",
                      details: [
                        "Board Kanban com 3 colunas (Pendentes, Em Desenvolvimento, Finalizadas)",
                        "Ver detalhes completos da tarefa",
                        "Código atual vs código sugerido em diff visual",
                      ],
                    },
                    {
                      step: "6",
                      title: "Desenvolvedor: Mover para Em Desenvolvimento",
                      description: "Clica em 'Iniciar Desenvolvimento' para mover a tarefa e começar o trabalho",
                      actor: "Dev",
                      details: [
                        "Status muda automaticamente para 'em_progresso'",
                        "Timestamp de início é registrado",
                        "Notificação enviada para o Admin Cliente",
                      ],
                    },
                    {
                      step: "7",
                      title: "Desenvolvedor: Aplicar Correção Automaticamente",
                      description:
                        "Clica em 'Aplicar Correção' e o sistema cria branch, commit e Pull Request automaticamente",
                      actor: "Dev + Sistema",
                      details: [
                        "Sistema cria branch: fix/cnpj-line-{line}-{timestamp}",
                        "Aplica mudança no arquivo específico",
                        "Cria commit com mensagem detalhada",
                        "Abre Pull Request no GitHub/Azure DevOps",
                      ],
                    },
                    {
                      step: "8",
                      title: "Desenvolvedor: Revisar e Aprovar PR",
                      description: "Desenvolvedor vai para GitHub/Azure DevOps, analisa o Pull Request gerado e aprova",
                      actor: "Dev",
                      details: [
                        "Revisar diff visual do código",
                        "Verificar testes automatizados",
                        "Aprovar e fazer merge para branch principal",
                      ],
                    },
                    {
                      step: "9",
                      title: "Desenvolvedor: Finalizar Tarefa",
                      description:
                        "Volta ao dashboard e clica em 'Finalizar Tarefa', informando commit hash e número do PR",
                      actor: "Dev",
                      details: [
                        "Preenche commit hash (ex: a1b2c3d4)",
                        "Informa número do PR (ex: 123)",
                        "Status muda para 'concluida'",
                        "Pontos de gamificação são creditados",
                      ],
                    },
                    {
                      step: "10",
                      title: "Admin Cliente: Acompanhar Progresso",
                      description:
                        "Monitora o progresso no dashboard com métricas em tempo real e gera relatórios finais",
                      actor: "Admin Cliente",
                      details: [
                        "Visualiza taxa de conclusão de tarefas",
                        "Analisa velocity da equipe",
                        "Gera relatórios em PDF/Excel",
                        "Exporta dados para apresentação",
                      ],
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        {index < 9 && <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-cyan-500 my-2" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.actor}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        {item.details && (
                          <ul className="space-y-1 mt-2">
                            {item.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usando o Chatbot Inteligente</CardTitle>
                <CardDescription>Assistente IA disponível em todas as páginas do dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">O que o Chatbot Pode Fazer:</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Listar suas tarefas pendentes, em progresso ou concluídas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Filtrar tarefas por repositório específico</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Mostrar estatísticas de tarefas por status e prioridade</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Ver detalhes completos de uma tarefa específica com código</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Responder perguntas sobre o sistema e funcionalidades</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Exemplos de Comandos:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3 bg-card">
                        <code className="text-sm text-purple-600">"Minhas tarefas pendentes"</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lista todas as suas tarefas que ainda não foram iniciadas
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-card">
                        <code className="text-sm text-purple-600">"Tarefas do repositório card-brazil-v2"</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Filtra tarefas de um repositório específico
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-card">
                        <code className="text-sm text-purple-600">"Quantas tarefas tenho?"</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mostra estatísticas completas das suas tarefas
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-card">
                        <code className="text-sm text-purple-600">"Ver tarefa #42"</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Exibe detalhes completos de uma tarefa específica
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-card">
                        <code className="text-sm text-purple-600">"Tarefas de alta prioridade"</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lista apenas tarefas marcadas como alta prioridade
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-card">
                        <code className="text-sm text-purple-600">"Ajuda"</code>
                        <p className="text-xs text-muted-foreground mt-1">Mostra todos os comandos disponíveis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis-guide" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Guia Completo: Analisando Repositórios</CardTitle>
                <CardDescription>
                  Passo a passo detalhado para executar análises de repositórios no CNPJ Detector
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Azure DevOps Cloud vs On-Premise */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <GitBranch className="h-6 w-6 text-blue-600" />
                    Azure DevOps: Cloud vs On-Premise
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border-2 border-blue-500 rounded-lg p-5 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600">Azure DevOps Services (Cloud)</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">URL Padrão:</h4>
                          <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded block">
                            https://dev.azure.com/SuaOrganizacao
                          </code>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Características:</h4>
                          <ul className="text-sm space-y-1">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              Hospedado na nuvem da Microsoft
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              Sempre atualizado automaticamente
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              API versão 7.0 garantida
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              Sem necessidade de manutenção
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Exemplo Completo:</h4>
                          <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded block break-all">
                            https://dev.azure.com/BS2Tech/FinTech/_git/card-brazil-v2
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            Organização: BS2Tech | Projeto: FinTech | Repo: card-brazil-v2
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-purple-500 rounded-lg p-5 bg-purple-50 dark:bg-purple-950">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600">Azure DevOps Server (On-Premise)</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">URL Personalizada:</h4>
                          <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded block">
                            https://devops.bs2.com/BS2Tech
                          </code>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Características:</h4>
                          <ul className="text-sm space-y-1">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              Servidor próprio da empresa
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              Controle total da infraestrutura
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              Maior segurança e compliance
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              Versão da API pode variar
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Exemplo Completo:</h4>
                          <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded block break-all">
                            https://devops.bs2.com/BS2Tech/Backend/_git/api-users
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            Organização: BS2Tech | Projeto: Backend | Repo: api-users
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Importante sobre Compatibilidade:
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      O sistema CNPJ Detector suporta AMBOS os tipos automaticamente! Não é necessário configurar nada
                      diferente. O sistema detecta automaticamente se a URL é Cloud (dev.azure.com) ou On-Premise
                      (devops.suaempresa.com) e se adapta automaticamente para usar a API correta.
                    </p>
                  </div>
                </div>

                {/* Step by Step Analysis Guide */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-6 w-6 text-green-600" />
                    Passo a Passo: Executando uma Análise
                  </h3>

                  <div className="space-y-6">
                    {[
                      {
                        step: "1",
                        title: "Conectar sua Conta Azure DevOps ou GitHub",
                        description:
                          "Primeiro, você precisa conectar sua conta Git ao sistema para acessar os repositórios",
                        details: [
                          "No dashboard, acesse Configurações",
                          "Clique em 'Conectar Azure DevOps' ou 'Conectar GitHub'",
                          "Informe: Organização, Projeto (se Azure) e Personal Access Token (PAT)",
                          "Clique em 'Salvar Integração'",
                          "O sistema testará a conexão e confirmará se está funcionando",
                        ],
                        note: "Para Azure On-Premise, use a URL completa como https://devops.bs2.com/BS2Tech",
                      },
                      {
                        step: "2",
                        title: "Configurar Padrões de Detecção de CNPJ",
                        description: "Defina como o sistema deve procurar campos CNPJ no código e banco de dados",
                        details: [
                          "Em Configurações, acesse a seção 'Padrões CNPJ'",
                          "Configure nomes de campos de banco: cnpj, cpf_cnpj, num_documento, etc.",
                          "Configure tipos detectados: varchar, bigint, decimal, etc.",
                          "Defina extensões de arquivo: .cs, .java, .ts, .sql, etc.",
                          "Salve as configurações",
                        ],
                        note: "Esses padrões são usados pelo sistema para identificar onde CNPJ é usado",
                      },
                      {
                        step: "3",
                        title: "Iniciar Nova Análise",
                        description: "Execute a análise selecionando os repositórios que deseja escanear",
                        details: [
                          "No dashboard, acesse a aba 'Análises'",
                          "Clique no botão 'Nova Análise'",
                          "Selecione a conta Git conectada (Azure DevOps ou GitHub)",
                          "Marque os repositórios que deseja analisar (pode selecionar múltiplos)",
                          "Clique em 'Iniciar Análise'",
                        ],
                        note: "Para análises grandes (100+ repos), o sistema usa processamento em chunks automático",
                      },
                      {
                        step: "4",
                        title: "Acompanhar Progresso da Análise",
                        description: "Monitore em tempo real o progresso da análise dos repositórios",
                        details: [
                          "Você será redirecionado para tela de progresso automaticamente",
                          "Barra de progresso mostra porcentagem de 0% a 100%",
                          "Contador mostra quantos repositórios foram analisados (ex: 18/28)",
                          "Logs mostram qual repositório está sendo processado",
                          "Pode fechar a tela - análise continua em background!",
                        ],
                        note: "Análises grandes podem levar minutos. O sistema envia notificação quando concluir.",
                      },
                      {
                        step: "5",
                        title: "Visualizar Resultados da Análise",
                        description: "Após conclusão, veja todos os arquivos e linhas que precisam ser alterados",
                        details: [
                          "No grid de Análises, clique em 'Exibir Detalhes' na análise concluída",
                          "Veja cards com métricas: Ocorrências no Código, Campos de Banco, Estimativa de Horas",
                          "Seção 'Ocorrências no Código' mostra: Projeto → Repositório → Arquivo → Linha",
                          "Para cada ocorrência, veja código atual e solução sugerida",
                          "Botão 'Baixar Relatório' gera ZIP com PDF, CSV e JSON",
                        ],
                        note: "Os relatórios contêm hierarquia completa: Organização → Projeto → Repositório → Arquivo",
                      },
                      {
                        step: "6",
                        title: "Gerar Relatórios",
                        description: "Exporte os resultados em múltiplos formatos para documentação e apresentação",
                        details: [
                          "Na página de detalhes da análise, clique em 'Baixar Relatório'",
                          "Sistema gera automaticamente arquivo ZIP contendo:",
                          "• PDF: Relatório visual formatado com métricas e código",
                          "• CSV/Excel: Planilha com todas as ocorrências (Projeto, Repo, Arquivo, Linha)",
                          "• JSON: Dados estruturados para integração com outras ferramentas",
                          "Nome do arquivo inclui ID da análise para organização",
                        ],
                        note: "Relatórios PDF seguem o mesmo layout visual da tela de detalhes",
                      },
                      {
                        step: "7",
                        title: "Criar Tarefas para Desenvolvedores",
                        description: "Transforme os achados da análise em tarefas atribuídas para sua equipe",
                        details: [
                          "Na aba 'Tarefas', clique em 'Nova Tarefa'",
                          "Preencha: Título, Descrição, Repositório, Arquivo, Linha",
                          "Selecione o desenvolvedor responsável no dropdown",
                          "A tarefa é salva automaticamente como 'Pendente'",
                          "Desenvolvedor receberá a tarefa no board Kanban dele",
                        ],
                        note: "Tarefas podem ser sincronizadas com Azure DevOps Boards automaticamente",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {item.step}
                          </div>
                          {index < 6 && (
                            <div className="w-0.5 h-full bg-gradient-to-b from-green-500 to-emerald-500 my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          {item.details && (
                            <ul className="space-y-2 mb-3">
                              {item.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                          {item.note && (
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3">
                              <p className="text-xs text-blue-800 dark:text-blue-200">
                                <strong>Dica:</strong> {item.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Documentation Link */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Code2 className="h-6 w-6 text-purple-600" />
                    Documentação da API (Swagger)
                  </h3>

                  <Card className="border-2 border-purple-500">
                    <CardHeader>
                      <CardTitle>API REST Completa</CardTitle>
                      <CardDescription>
                        Acesse a documentação Swagger interativa para testar todos os endpoints da API
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        O CNPJ Detector possui uma API REST completa documentada no formato Swagger/OpenAPI. Na
                        documentação você pode:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Visualizar todos os endpoints disponíveis organizados por categoria
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Testar cada endpoint diretamente no navegador com exemplos de JSON
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Ver exemplos de request e response para cada operação
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Copiar URLs e exemplos de código facilmente
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Autenticar com seu token JWT para testar chamadas protegidas
                        </li>
                      </ul>

                      <div className="flex gap-3 mt-4">
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                          <Link href="/api-docs">
                            <Code2 className="h-4 w-4 mr-2" />
                            Acessar Documentação Swagger
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/api-docs" target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir em Nova Aba
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Troubleshooting */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Problemas Comuns e Soluções</h3>

                  <div className="space-y-4">
                    {[
                      {
                        problem: "Análise fica travada em 0% ou porcentagem baixa",
                        solutions: [
                          "Verifique se o Personal Access Token (PAT) do Azure DevOps está válido",
                          "Confirme que o PAT tem permissões de leitura em Code",
                          "Para On-Premise, verifique se a URL está correta (https://devops.empresa.com)",
                          "Tente analisar menos repositórios por vez (máximo 50-100)",
                        ],
                      },
                      {
                        problem: "Relatórios não mostram ocorrências",
                        solutions: [
                          "Verifique se as Configurações de Padrões CNPJ estão corretas",
                          "Confirme que as extensões de arquivo incluem as do seu projeto (.cs, .java, .ts)",
                          "Verifique se os nomes de campos estão configurados (cnpj, cpf_cnpj, etc.)",
                          "Execute o script SQL 026 para adicionar colunas project e repository",
                        ],
                      },
                      {
                        problem: "Erro 404 ao baixar relatório",
                        solutions: [
                          "Aguarde a análise completar 100% antes de gerar relatório",
                          "Recarregue a página e tente novamente",
                          "Verifique os logs do sistema para erros específicos",
                        ],
                      },
                      {
                        problem: "Azure DevOps On-Premise não conecta",
                        solutions: [
                          "Use a URL completa: https://devops.empresa.com/Organizacao",
                          "Verifique se o servidor On-Premise é acessível da internet",
                          "Confirme que o PAT foi gerado no servidor On-Premise correto",
                          "Teste o acesso manual via navegador primeiro",
                        ],
                      },
                    ].map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-card">
                        <h4 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">
                          Problema: {item.problem}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">Soluções:</p>
                        <ul className="space-y-1">
                          {item.solutions.map((solution, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <span className="text-green-600 font-bold">✓</span>
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW TAB: Beginner Guide */}
          <TabsContent value="beginner-guide" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  Guia para Iniciantes
                </CardTitle>
                <CardDescription>Explicação simples e clara para quem não tem conhecimento técnico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* What is the system */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">O que é este sistema?</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg border">
                    <p className="text-base mb-4">
                      Este sistema ajuda empresas a se prepararem para a <strong>mudança do CNPJ</strong> que acontecerá
                      em 2026.
                    </p>
                    <p className="text-base mb-4">
                      O formato do CNPJ mudará de <strong>apenas números</strong> para <strong>letras e números</strong>
                      .
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300">
                        <p className="text-sm font-semibold text-red-600 mb-2">Hoje (2025):</p>
                        <code className="text-lg font-mono">12.345.678/0001-90</code>
                        <p className="text-xs text-muted-foreground mt-2">Apenas 14 números</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300">
                        <p className="text-sm font-semibold text-green-600 mb-2">2026 em diante:</p>
                        <code className="text-lg font-mono">A1B2C3D4E5F6G7H8</code>
                        <p className="text-xs text-muted-foreground mt-2">18 caracteres (números + letras)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What the system does */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">O que o sistema faz?</h3>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Procura automaticamente onde seu CNPJ está no código</p>
                        <p className="text-sm text-muted-foreground">
                          Sistema lê todos os arquivos de programação e encontra CNPJs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Encontra onde está no banco de dados</p>
                        <p className="text-sm text-muted-foreground">
                          Conecta no banco e identifica tabelas e campos com CNPJ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Cria uma lista de tarefas do que precisa mudar</p>
                        <p className="text-sm text-muted-foreground">
                          Cada arquivo com problema vira uma tarefa para o programador
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Gera relatórios bonitos em PDF e Excel</p>
                        <p className="text-sm text-muted-foreground">
                          Mostra tudo de forma visual, com gráficos e explicações claras
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Who uses */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Quem usa este sistema?</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-2 border-purple-200">
                      <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-base">Super Admin</CardTitle>
                        <CardDescription className="text-xs">Administrador Geral</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p>Gerencia TUDO no sistema</p>
                        <p>Vê todos os clientes</p>
                        <p>Cria contas para clientes</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-base">Admin Cliente</CardTitle>
                        <CardDescription className="text-xs">Gerente da Empresa</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p>Gerencia sua própria empresa</p>
                        <p>Adiciona programadores</p>
                        <p>Pede análises e vê relatórios</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-200">
                      <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2">
                          <Code className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-base">Desenvolvedor</CardTitle>
                        <CardDescription className="text-xs">Programador</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p>Recebe tarefas para fazer</p>
                        <p>Arrasta tarefas no quadro</p>
                        <p>Informa quando terminou</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Scripts FAQ */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Scripts SQL - Perguntas e Respostas</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4 py-3">
                      <p className="font-semibold mb-2">P: O que é um "script SQL"?</p>
                      <p className="text-sm text-muted-foreground">
                        É um arquivo com comandos para criar tabelas no banco de dados. Pense como se fosse criar pastas
                        e gavetas para guardar informações. Você só precisa executar UMA VEZ na instalação.
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-3">
                      <p className="font-semibold mb-2">P: Quais scripts preciso executar?</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Instalação NOVA:</strong> Execute TODOS os scripts na ordem (001, 002, 003... até o
                        último)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Sistema JÁ RODANDO:</strong> Execute apenas os scripts NOVOS que ainda não rodou
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4 py-3">
                      <p className="font-semibold mb-2">P: Como sei se já executei um script?</p>
                      <p className="text-sm text-muted-foreground">
                        Se o sistema está funcionando normalmente, você já executou os scripts básicos. Scripts novos
                        aparecem quando adicionamos funcionalidades. Em caso de dúvida, pode executar de novo (não
                        quebra nada!).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Worker Local */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Worker Local - Análise Mais Rápida (OPCIONAL)</h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-lg border-2 border-green-300">
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold mb-2">O que é?</p>
                        <p className="text-sm text-muted-foreground">
                          Um programa que roda no seu computador e torna a análise 10x mais rápida. Totalmente opcional
                          (funciona sem ele também!).
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">É fácil de instalar?</p>
                        <p className="text-sm text-muted-foreground">
                          SIM! Apenas 2 cliques: 1º Baixa o ZIP, 2º Abre o arquivo "INICIAR-WORKER.bat". PRONTO! Sistema
                          faz o resto sozinho.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Como saber se está funcionando?</p>
                        <p className="text-sm text-muted-foreground">
                          Olhe no canto superior direito da tela. Se vir 🟢 <strong>Worker Online</strong> = Está
                          rodando! Se vir 🟡 <strong>Worker Offline</strong> = Não está rodando (mas tudo bem!).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Perguntas Frequentes</h3>
                  <div className="space-y-3">
                    {[
                      {
                        q: "Preciso saber programar para usar?",
                        a: "NÃO! Se você é Admin Cliente, só precisa clicar em botões. Sistema faz tudo sozinho.",
                      },
                      {
                        q: "E se der erro?",
                        a: "Sistema mostra mensagens claras explicando o problema. Em caso de dúvida, contate suporte.",
                      },
                      {
                        q: "Posso analisar quantos repositórios?",
                        a: "SIM! Sistema suporta 1500+ repositórios sem problemas. Analisa todos automaticamente.",
                      },
                      {
                        q: "Os relatórios são difíceis de entender?",
                        a: "NÃO! Relatórios são feitos para pessoas SEM conhecimento técnico. Tem gráficos bonitos e explicações claras.",
                      },
                      {
                        q: "Preciso instalar algo no meu computador?",
                        a: "NÃO para usar o sistema (funciona no navegador). SIM apenas se quiser análise mais rápida (Worker Local opcional).",
                      },
                      {
                        q: "Como saber se a análise terminou?",
                        a: "Sistema mostra notificação verde na tela 'Análise Concluída!' e atualiza automaticamente.",
                      },
                    ].map((faq, i) => (
                      <div key={i} className="border-l-4 border-gray-300 pl-4 py-3">
                        <p className="font-semibold mb-2">P: {faq.q}</p>
                        <p className="text-sm text-muted-foreground">R: {faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="screenshots" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Screenshots do Sistema</CardTitle>
                <CardDescription>Capturas de tela das principais telas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Dashboard do Admin Cliente</h3>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Tela principal com abas: Análises, Tarefas, Desenvolvedores, Relatórios e Configurações
                      </p>
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Captura de tela disponível no sistema em execução</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Kanban Board do Desenvolvedor</h3>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Board com 3 colunas coloridas (Pendente, Em Desenvolvimento, Concluído) e drag-and-drop
                      </p>
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Captura de tela disponível no sistema em execução</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Tela de Análise em Progresso</h3>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Barra de progresso visual com percentual e contador de repositórios processados
                      </p>
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Captura de tela disponível no sistema em execução</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Dashboard de Relatórios com Gráficos</h3>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Gráficos interativos mostrando evolução temporal, distribuição por projeto e top repositórios
                      </p>
                      <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Captura de tela disponível no sistema em execução</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Nota:</strong> Para obter screenshots atualizadas em tempo real das telas do sistema, acesse
                    o sistema em execução e utilize as funcionalidades de captura de tela do navegador ou ferramentas
                    como o Chrome DevTools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Stack Tecnológica</CardTitle>
                <CardDescription>Linguagens, frameworks e banco de dados utilizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Frontend</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Next.js 16</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Framework React com App Router, Server Components e React 19.2
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-cyan-600" />
                        <h4 className="font-medium">TypeScript</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Linguagem principal com tipagem estática completa</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium">Tailwind CSS v4</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Framework CSS utility-first com theme customizado</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-orange-600" />
                        <h4 className="font-medium">shadcn/ui</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Biblioteca de componentes UI com Radix UI primitives
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Backend</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">Supabase (PostgreSQL)</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Banco de dados principal com 53 tabelas, Row Level Security (RLS) e Auth
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Next.js API Routes</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Route Handlers serverless para todas as APIs REST</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-pink-600" />
                        <h4 className="font-medium">Vercel AI SDK</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Análise de código com IA usando modelos OpenAI, Anthropic e xAI
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-medium">bcryptjs</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Hash de senhas com salt rounds para segurança</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Integrações</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="h-5 w-5 text-gray-800" />
                        <h4 className="font-medium">GitHub API</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        OAuth 2.0, listagem de repositórios e análise de código-fonte
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="h-5 w-5 text-orange-600" />
                        <h4 className="font-medium">GitLab API</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Suporte completo para repositórios GitLab self-hosted e cloud
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Conectores de Banco</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        MySQL, PostgreSQL, Oracle com análise de schema automática
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium">Azure DevOps</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Integração com repositórios Git do Azure DevOps</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estrutura do Banco de Dados</CardTitle>
                <CardDescription>53 tabelas com Row Level Security (RLS) habilitado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Core</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• users - Usuários do sistema</li>
                      <li>• clients - Clientes cadastrados</li>
                      <li>• permissions - Permissões de acesso</li>
                      <li>• role_permissions - Roles e permissões</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Análises</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• analyses - Análises de repositórios</li>
                      <li>• batch_analyses - Análises em lote</li>
                      <li>• findings - Achados de código</li>
                      <li>• database_findings - Achados de banco</li>
                      <li>• ai_suggestions - Sugestões de IA</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Tarefas</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• tasks - Tarefas de desenvolvimento</li>
                      <li>• task_history - Histórico de mudanças</li>
                      <li>• sprints - Sprints ágeis</li>
                      <li>• daily_standups - Daily standups</li>
                      <li>• sprint_retrospectives - Retrospectivas</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Git</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• repositories - Repositórios Git</li>
                      <li>• github_tokens - Tokens OAuth GitHub</li>
                      <li>• repository_selections - Seleções</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Banco de Dados</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• database_connections - Conexões</li>
                      <li>• database_analyses - Análises BD</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Sistema</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• notifications - Notificações</li>
                      <li>• activity_logs - Logs de auditoria</li>
                      <li>• reports - Relatórios gerados</li>
                      <li>• comments - Comentários</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Segurança com RLS:</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Todas as tabelas principais possuem Row Level Security (RLS) habilitado, garantindo que usuários só
                    acessem dados do seu próprio cliente. Service Role Key é usado apenas em operações de backend
                    confiáveis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Atualizações</CardTitle>
                <CardDescription>Melhorias e funcionalidades implementadas recentemente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "Hoje",
                      title: "Sistema de Notificações Profissional",
                      items: [
                        "Substituição de todos os 51 alerts/confirms feios por modais bonitos do shadcn/ui",
                        "Componente NotificationDialog com tipos success, error, warning, info",
                        "Hook useNotification para fácil integração em qualquer componente",
                        "Interface consistente e profissional em todo o sistema",
                      ],
                    },
                    {
                      date: "Hoje",
                      title: "Limpeza de Tarefas em Massa",
                      items: [
                        "Botão Limpar Tarefas para remover todas as tarefas de um desenvolvedor específico",
                        "Botão Excluir Tarefas ao lado de Nova Tarefa para limpar TODAS as tarefas do cliente",
                        "Preview detalhado mostrando quantas tarefas, progresso, histórico e comentários serão excluídos",
                        "Confirmação em dois níveis com digitação de CONFIRMAR EXCLUSÃO",
                        "Modal de sucesso após conclusão mostrando resumo da limpeza",
                      ],
                    },
                    {
                      date: "Hoje",
                      title: "Gestão de Projetos Azure DevOps",
                      items: [
                        "Campo Projeto adicionado ao cadastro de conta Azure DevOps",
                        "Suporte para múltiplos projetos por organização Azure",
                        "Edição de projeto em contas existentes",
                        "Melhor organização e separação de repositórios por projeto",
                      ],
                    },
                    {
                      date: "Hoje",
                      title: "Aba de Repositórios Funcional",
                      items: [
                        "Nova aba Repositórios no dashboard exibindo todos os repositórios conectados",
                        "Lista com provider, organização, projeto, última análise e total de análises",
                        "Navegação funcional do widget Repositórios para aba dedicada",
                        "API endpoint para buscar repositórios com estatísticas completas",
                      ],
                    },
                    {
                      date: "Hoje",
                      title: "Chatbot Inteligente Implementado",
                      items: [
                        "Widget flutuante em todas as páginas do dashboard",
                        "Detecção automática de intenção com IA",
                        "Comandos para listar tarefas, filtrar por repositório, ver estatísticas",
                        "Histórico de conversas persistido no banco de dados",
                        "Respostas formatadas em markdown com emojis",
                      ],
                    },
                    {
                      date: "13/11/2025",
                      title: "Sistema de Análise Completo",
                      items: [
                        "Correção definitiva do fluxo de análise de repositórios",
                        "Implementação de progresso em tempo real (0% → 100%)",
                        "Contador de arquivos analisados em tela",
                        "Salvamento automático de repositórios na tabela repositories",
                        "Suporte completo para batch analyses",
                        "Remoção de dependências de cookies() em background jobs",
                      ],
                    },
                    {
                      date: "13/11/2025",
                      title: "Melhorias na Interface",
                      items: [
                        "Modal de confirmação customizada para exclusão de análises",
                        "Tabela de tarefas reformulada com colunas claras (Repositório, Arquivo, Dev, Status)",
                        "Botões de ação (Exibir, Alterar, Excluir) em todas as tarefas",
                        "Correção de múltiplas instâncias do Supabase Client",
                        "Padronização de cards na landing page",
                      ],
                    },
                  ].map((update, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{update.date}</Badge>
                        <h3 className="font-semibold">{update.title}</h3>
                      </div>
                      <ul className="space-y-1">
                        {update.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arquitetura do Sistema</CardTitle>
                <CardDescription>Organização de pastas e estrutura do projeto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                    <pre className="text-sm overflow-x-auto">
                      {`/
├── app/                      # Next.js App Router
│   ├── api/                 # Route Handlers (APIs REST)
│   │   ├── analyze/        # Análise de repositórios
│   │   ├── auth/           # Autenticação e login
│   │   ├── client/         # APIs do Admin Cliente
│   │   ├── dev/            # APIs do Desenvolvedor
│   │   └── admin/          # APIs do Super Admin
│   ├── analysis/[id]/      # Página de detalhes da análise
│   ├── analyzer/           # Página de execução de análise
│   ├── dashboard/          # Dashboard principal
│   ├── tasks/              # Página de tarefas (Kanban)
│   └── wiki/               # Documentação
│
├── components/             # Componentes React
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Componentes do dashboard
│   ├── dev/               # Componentes do desenvolvedor
│   └── landing/           # Landing page
│
├── lib/                    # Utilitários e helpers
│   ├── analyzer/          # Motor de análise de código
│   ├── supabase/          # Cliente Supabase singleton
│   └── auth.ts            # Funções de autenticação
│
└── scripts/               # Scripts SQL e migrations`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Principais Diretórios:</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge>app/api/*</Badge>
                        <span className="text-sm text-muted-foreground">
                          Route Handlers serverless para todas as APIs
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge>lib/analyzer/</Badge>
                        <span className="text-sm text-muted-foreground">
                          Motor de análise de código e banco de dados
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge>components/dashboard/</Badge>
                        <span className="text-sm text-muted-foreground">Tabs e seções do dashboard por perfil</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge>scripts/</Badge>
                        <span className="text-sm text-muted-foreground">Scripts SQL para criação e seed do banco</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW TAB: Documentation */}
          <TabsContent value="documentacao" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Central de Documentação</CardTitle>
                <CardDescription>Acesse toda documentação técnica, funcional e comercial</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      APIs e Testes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <a
                        href="/api-docs"
                        target="_blank"
                        className="text-blue-600 hover:underline font-medium flex items-center gap-2"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Swagger UI Interativo
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">OpenAPI 3.0 com todos endpoints</p>
                    </div>
                    <div>
                      <a
                        href="/docs/openapi-swagger.json"
                        download
                        className="text-blue-600 hover:underline font-medium flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download OpenAPI JSON
                      </a>
                    </div>
                    <div>
                      <a
                        href="/docs/postman-collection.json"
                        download
                        className="text-blue-600 hover:underline font-medium flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Postman Collection
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Documentação Funcional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="/DOCUMENTACAO-FUNCIONAL.md"
                      target="_blank"
                      className="text-green-600 hover:underline"
                      rel="noreferrer"
                    >
                      Ver Documentação
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Documentação Técnica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="/DOCUMENTACAO-TECNICA.md"
                      target="_blank"
                      className="text-purple-600 hover:underline"
                      rel="noreferrer"
                    >
                      Ver Documentação
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Proposta Comercial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="/PROPOSTA-COMERCIAL.md"
                      target="_blank"
                      className="text-orange-600 hover:underline"
                      rel="noreferrer"
                    >
                      Ver Proposta
                    </a>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CHATBOT FLOATING BUTTON AND PANEL */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-2xl bg-primary hover:bg-primary/90"
            onClick={() => setChatOpen(!chatOpen)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>

          {chatOpen && (
            <Card className="absolute bottom-20 right-0 w-96 h-[500px] shadow-2xl flex flex-col">
              <CardHeader className="bg-primary text-white rounded-t-lg">
                <CardTitle className="text-lg">Assistente CNPJ</CardTitle>
                <p className="text-xs text-primary-foreground/80">Pergunte sobre o sistema</p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-white" : "bg-slate-100"}`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Digitando...</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Pergunte algo..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={loading}>
                  Enviar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
