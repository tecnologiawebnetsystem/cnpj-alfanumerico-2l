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
  Bell,
  Settings,
  Clock,
  Play,
  Target,
  Brain,
  Timer,
  Lightbulb,
  KanbanSquare,
  ListTodo,
  User,
  LayoutDashboard,
  FolderGit2,
  Search,
  Filter,
  GripVertical,
} from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function WikiPage() {
  const profiles = [
    {
      role: "Super Admin",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      description: "Controle absoluto do sistema com acesso a todas as funcionalidades administrativas",
      permissions: [
        "Gerenciar todos os clientes e suas licencas",
        "Criar, editar e remover usuarios de qualquer tipo",
        "Visualizar todos os repositorios e analises",
        "Gerar relatorios consolidados de todos os clientes",
        "Configurar integracoes e sistema",
        "Acessar logs de auditoria completos",
        "Gerenciar permissoes e roles",
      ],
      features: [
        {
          title: "Dashboard Global",
          description: "Visao consolidada de todos os clientes, analises e metricas do sistema",
        },
        {
          title: "Gerenciamento de Clientes",
          description: "CRUD completo de clientes com controle de CNPJ, email, status e informacoes",
        },
        {
          title: "Controle de Licencas",
          description: "Ativar, desativar e gerenciar licencas de acesso de cada cliente",
        },
        {
          title: "Gerenciamento de Usuarios",
          description: "Criar admins de cliente e devs, associar a clientes especificos",
        },
        {
          title: "Relatorios Avancados",
          description: "Gerar relatorios de clientes, licencas, analises e financeiro em PDF/Excel",
        },
        {
          title: "Configuracoes do Sistema",
          description: "Ajustar parametros globais, integracoes e variaveis de ambiente",
        },
      ],
    },
    {
      role: "Admin Cliente",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: "Gerencia a equipe de desenvolvedores e repositorios do seu cliente",
      permissions: [
        "Visualizar dados apenas do seu cliente",
        "Gerenciar desenvolvedores (devs) do cliente",
        "Conectar e gerenciar repositorios Git",
        "Criar e gerenciar conexoes de banco de dados",
        "Executar analises de CNPJ em repositorios",
        "Criar e atribuir tasks para devs",
        "Visualizar relatorios e analises do cliente",
        "Gerenciar sprints e metodologia agil",
      ],
      features: [
        {
          title: "Dashboard do Cliente",
          description: "Visao geral de repositorios, analises, tasks e metricas do cliente",
        },
        {
          title: "Gerenciamento de Devs",
          description: "Criar, editar e remover desenvolvedores da equipe",
        },
        {
          title: "Repositorios Git",
          description: "Conectar GitHub, visualizar repos e executar analises automaticas",
        },
        {
          title: "Analise de Banco de Dados",
          description: "Conectar bancos (MySQL, PostgreSQL, Oracle) e analisar campos CNPJ",
        },
        {
          title: "Gestao de Tasks",
          description: "Criar tasks, atribuir para devs, acompanhar progresso com Kanban",
        },
        {
          title: "Relatorios Personalizados",
          description: "Gerar relatorios de analises por repositorio ou desenvolvedor",
        },
        {
          title: "Sistema de Sprints",
          description: "Criar sprints, daily standups e retrospectivas da equipe",
        },
        {
          title: "Gamificacao",
          description: "Acompanhar pontuacao, conquistas e ranking dos desenvolvedores",
        },
      ],
    },
    {
      role: "Desenvolvedor (Dev)",
      icon: Code,
      color: "from-green-500 to-emerald-500",
      description: "Executa tarefas usando board Kanban com controle de horas estilo Azure DevOps",
      permissions: [
        "Visualizar tasks atribuidas a ele no board Kanban",
        "Mover tasks entre Pendentes, Em Desenvolvimento e Finalizadas",
        "Adicionar commit hash e numero do PR ao finalizar task",
        "Visualizar detalhes completos de cada task incluindo sugestao da IA",
        "Editar controle de horas (estimado, restante, completado)",
        "Receber notificacoes quando tasks sao atribuidas",
        "Visualizar suas proprias metricas e pontos",
      ],
      features: [
        {
          title: "Board Kanban com Drag-and-Drop",
          description: "Interface visual com 3 colunas: Pendentes, Em Desenvolvimento e Finalizadas com arraste e solte",
        },
        {
          title: "Modal de Detalhes Completo",
          description: "Ao clicar em qualquer card, abre modal com codigo atual, codigo sugerido, analise e sugestao da IA",
        },
        {
          title: "Controle de Horas (Azure DevOps)",
          description: "Horas estimadas, restantes e completadas com barra de progresso visual",
        },
        {
          title: "Commit e PR Obrigatorios",
          description: "Ao finalizar, deve informar o commit hash e numero do PR para documentacao",
        },
        {
          title: "Sistema de Notificacoes",
          description: "Recebe notificacoes automaticas quando admin atribui novas tarefas",
        },
        {
          title: "Filtros Avancados",
          description: "Filtrar por repositorio, status, prioridade e busca por texto",
        },
      ],
    },
  ]

  const systemFeatures = [
    {
      icon: Database,
      title: "Analise de Banco de Dados",
      description:
        "Conecta em multiplos bancos (MySQL, PostgreSQL, Oracle) e identifica automaticamente campos CNPJ que precisam ser convertidos para alfanumerico.",
    },
    {
      icon: GitBranch,
      title: "Integracao Git",
      description:
        "Conecta com GitHub e Azure DevOps para analisar codigo-fonte, identificar validacoes de CNPJ e gerar tasks automaticas de conversao.",
    },
    {
      icon: Brain,
      title: "Analise com IA",
      description: "Usa IA para escanear codigo em multiplas linguagens, detectar uso de CNPJ e sugerir alteracoes com nivel de confianca.",
    },
    {
      icon: KanbanSquare,
      title: "Board Kanban Drag-and-Drop",
      description:
        "Interface visual estilo Jira com arraste e solte para mover tarefas entre colunas de status.",
    },
    {
      icon: Timer,
      title: "Controle de Horas (Azure DevOps)",
      description: "Sistema de horas estimadas, restantes e completadas com barra de progresso, igual ao Azure DevOps.",
    },
    {
      icon: Bell,
      title: "Sistema de Notificacoes",
      description:
        "Notificacoes automaticas quando admin atribui tarefas, com icone de sino e badge de contagem.",
    },
    {
      icon: FileText,
      title: "Relatorios Detalhados Excel/PDF",
      description: "Relatorios completos com codigo antes/depois, contexto e estatisticas visuais em multiplas abas.",
    },
    {
      icon: BarChart3,
      title: "Integracao Azure DevOps",
      description:
        "Sincronize tarefas com Azure DevOps Boards, criando Work Items automaticamente com todas as informacoes.",
    },
    {
      icon: MessageCircle,
      title: "Chatbot Inteligente",
      description:
        "Assistente IA que responde perguntas sobre tarefas, repositorios e analises em tempo real com deteccao de intencao.",
    },
    {
      icon: User,
      title: "Perfil e Configuracoes",
      description:
        "Modal de perfil com informacoes do usuario e configuracoes de notificacoes e tema (claro/escuro).",
    },
    {
      icon: Filter,
      title: "Filtros Avancados",
      description:
        "Filtros por repositorio, status, prioridade e busca por texto em todas as telas de tarefas.",
    },
    {
      icon: Lightbulb,
      title: "Sugestao da IA",
      description:
        "Cada tarefa mostra a sugestao da IA com codigo corrigido, explicacao e nivel de confianca.",
    },
  ]

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
              Documentacao do Sistema
            </h1>
            <p className="text-lg text-muted-foreground">CNPJ Alfanumerico - Guia Completo v2.0</p>
            <Badge className="mt-2 bg-green-100 text-green-700">Atualizado em Janeiro 2026</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visao Geral</TabsTrigger>
            <TabsTrigger value="profiles">Perfis</TabsTrigger>
            <TabsTrigger value="dev-flow">Fluxo Dev</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="changelog">Novidades</TabsTrigger>
          </TabsList>

          {/* VISAO GERAL */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Sistema</CardTitle>
                <CardDescription>O que e e para que serve o CNPJ Alfanumerico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  O sistema <strong>CNPJ Alfanumerico</strong> e uma solucao inteligente desenvolvida para facilitar a
                  transicao de campos CNPJ numericos para o novo formato alfanumerico estabelecido pela Receita Federal
                  do Brasil.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Sobre a Mudanca do CNPJ:</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A partir de 2026, o formato de CNPJ passara de 14 digitos numericos para 18 caracteres
                    alfanumericos. Todos os sistemas que armazenam ou validam CNPJ precisam ser atualizados. Este
                    sistema automatiza a identificacao de onde essas mudancas sao necessarias (codigo-fonte, banco de
                    dados, APIs) e gerencia todo o processo de conversao.
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

          {/* PERFIS */}
          <TabsContent value="profiles" className="space-y-8 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfis do Sistema</CardTitle>
                <CardDescription>
                  Detalhamento de cada perfil, seus acessos e funcionalidades
                </CardDescription>
              </CardHeader>
            </Card>

            {profiles.map((profile) => (
              <Card key={profile.role} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${profile.color} flex items-center justify-center`}>
                      <profile.icon className="h-9 w-9 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{profile.role}</CardTitle>
                      <CardDescription>{profile.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Permissoes:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {profile.permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Funcionalidades:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {profile.features.map((feature, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm mb-1">{feature.title}</h5>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* FLUXO DO DESENVOLVEDOR */}
          <TabsContent value="dev-flow" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-6 w-6 text-green-600" />
                  Fluxo Completo do Desenvolvedor
                </CardTitle>
                <CardDescription>
                  Guia detalhado de todas as funcionalidades disponíveis para desenvolvedores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-blue-600" />
                    Header Padronizado
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Logo</Badge>
                        <span>ACT + CNPJ Detector</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Menu</Badge>
                        <span>Board Kanban, Lista de Tarefas, Documentacao (centralizado)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Notificacoes</Badge>
                        <span>Icone de sino com badge de contagem</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Perfil</Badge>
                        <span>Dropdown com Meu Perfil, Configuracoes e Sair</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Board Kanban */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <KanbanSquare className="h-5 w-5 text-purple-600" />
                    Board Kanban (/dev/board)
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Interface visual com 3 colunas para gerenciar tarefas com drag-and-drop.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-sm text-orange-700">Pendentes</span>
                        </div>
                        <p className="text-xs text-orange-600">Tarefas aguardando inicio</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm text-blue-700">Em Desenvolvimento</span>
                        </div>
                        <p className="text-xs text-blue-600">Tarefas em andamento</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm text-green-700">Finalizadas</span>
                        </div>
                        <p className="text-xs text-green-600">Tarefas concluidas</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 mt-3">
                      <h5 className="font-medium text-sm mb-2">Acoes disponiveis:</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Arrastar e soltar cards entre colunas</li>
                        <li>• Clicar no card para ver detalhes completos</li>
                        <li>• Botao "Iniciar" nas pendentes, "Finalizar" nas em progresso</li>
                        <li>• Ao finalizar, informar commit hash e numero do PR</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Modal de Detalhes */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Modal de Detalhes da Tarefa
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ao clicar em qualquer card do Kanban ou da lista, abre um modal completo com:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0">Titulo</Badge>
                        <span>Nome da tarefa com badges de status e prioridade</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0">Localizacao</Badge>
                        <span>Repositorio, arquivo e linha do codigo</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-red-100 text-red-700">Codigo Atual</Badge>
                        <span>Codigo com problema (destacado em vermelho)</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-green-100 text-green-700">Codigo Sugerido</Badge>
                        <span>Correcao sugerida (destacado em verde)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-purple-100 text-purple-700">Analise IA</Badge>
                        <span>Explicacao da IA com % de confianca</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-yellow-100 text-yellow-700">Sugestao IA</Badge>
                        <span>Recomendacao detalhada da IA</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-blue-100 text-blue-700">Horas</Badge>
                        <span>Controle de horas editavel</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0">Acoes</Badge>
                        <span>Botoes Iniciar/Finalizar conforme status</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controle de Horas */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Timer className="h-5 w-5 text-amber-600" />
                    Controle de Horas (Estilo Azure DevOps)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sistema de controle de horas igual ao Azure DevOps para acompanhar o esforco de cada tarefa.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="font-medium text-sm text-blue-700">Horas Estimadas</p>
                      <p className="text-xs text-blue-600">Quanto tempo voce acha que vai levar</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <Play className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                      <p className="font-medium text-sm text-orange-700">Horas Restantes</p>
                      <p className="text-xs text-orange-600">Quanto tempo ainda falta</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="font-medium text-sm text-green-700">Horas Completadas</p>
                      <p className="text-xs text-green-600">Quanto tempo ja foi gasto</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      A barra de progresso e calculada automaticamente: (completadas / estimadas) * 100%
                    </p>
                  </div>
                </div>

                {/* Lista de Tarefas */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-teal-600" />
                    Lista de Tarefas (/dev/tasks)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Visao em lista com estatisticas, filtros avancados e detalhes.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Cards de Estatisticas:</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Total</Badge>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700">Pendentes</Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">Em Progresso</Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-700">Concluidas</Badge>
                        <Badge variant="outline" className="bg-primary/10 text-primary">% Progresso</Badge>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2">Filtros Disponiveis:</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Busca por texto</Badge>
                        <Badge variant="outline">Filtro por Repositorio</Badge>
                        <Badge variant="outline">Filtro por Status</Badge>
                        <Badge variant="outline">Tabs (Todas, Pendentes, Progresso, Concluidas)</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notificacoes */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-red-600" />
                    Sistema de Notificacoes
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Receba notificacoes automaticas quando o Admin Cliente atribuir tarefas para voce.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Icone de sino no header com badge de contagem</li>
                      <li>• Dropdown mostra ultimas notificacoes</li>
                      <li>• Clique para marcar como lida</li>
                      <li>• Botao "Marcar todas como lidas"</li>
                    </ul>
                  </div>
                </div>

                {/* Perfil e Configuracoes */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Perfil e Configuracoes
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Meu Perfil:</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Nome completo</li>
                        <li>• Email</li>
                        <li>• Funcao (Desenvolvedor)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2">Configuracoes:</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Ativar/desativar notificacoes por email</li>
                        <li>• Ativar/desativar tema escuro</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FUNCIONALIDADES */}
          <TabsContent value="features" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Funcionalidades</CardTitle>
                <CardDescription>Lista completa de recursos do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {systemFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API */}
          <TabsContent value="api" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentacao da API</CardTitle>
                <CardDescription>Endpoints disponiveis para integracao</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button asChild>
                    <a href="/api-spec.json" download className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Baixar OpenAPI Spec
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/documentacao" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Ver Documentacao Completa
                    </Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Principais Endpoints:</h4>
                  
                  <div className="border rounded-lg divide-y">
                    <div className="p-3 flex items-center gap-3">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm">/api/auth/login</code>
                      <span className="text-sm text-muted-foreground">Autenticar usuario</span>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <Badge className="bg-blue-500">GET</Badge>
                      <code className="text-sm">/api/auth/me</code>
                      <span className="text-sm text-muted-foreground">Obter usuario atual</span>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <Badge className="bg-blue-500">GET</Badge>
                      <code className="text-sm">/api/dev/tasks</code>
                      <span className="text-sm text-muted-foreground">Listar tarefas do desenvolvedor</span>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <Badge className="bg-yellow-500">PUT</Badge>
                      <code className="text-sm">/api/dev/tasks/[id]</code>
                      <span className="text-sm text-muted-foreground">Atualizar tarefa (status, horas)</span>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <Badge className="bg-blue-500">GET</Badge>
                      <code className="text-sm">/api/dev/notifications</code>
                      <span className="text-sm text-muted-foreground">Listar notificacoes</span>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm">/api/analyze</code>
                      <span className="text-sm text-muted-foreground">Iniciar analise de repositorio</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHANGELOG / NOVIDADES */}
          <TabsContent value="changelog" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  Novidades da Versao 2.0
                </CardTitle>
                <CardDescription>Ultimas atualizacoes e melhorias do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Janeiro 2026 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">Janeiro 2026</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-green-100 text-green-700 mb-2">Header Padronizado</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Logo ACT + nome do sistema</li>
                        <li>• Menu de navegacao centralizado</li>
                        <li>• Sistema de notificacoes com badge</li>
                        <li>• Dropdown de perfil com Meu Perfil, Configuracoes e Sair</li>
                        <li>• Modais funcionais para perfil e configuracoes</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-blue-100 text-blue-700 mb-2">Board Kanban Melhorado</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Drag-and-drop funcional entre colunas</li>
                        <li>• Cards mais compactos e responsivos</li>
                        <li>• Modal de detalhes ao clicar no card</li>
                        <li>• Exibicao de codigo atual e sugerido</li>
                        <li>• Analise e sugestao da IA visivel</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-purple-100 text-purple-700 mb-2">Controle de Horas</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Horas estimadas, restantes e completadas</li>
                        <li>• Edicao inline no modal de detalhes</li>
                        <li>• Barra de progresso visual</li>
                        <li>• Estilo identico ao Azure DevOps</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-orange-100 text-orange-700 mb-2">Sistema de Notificacoes</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Notificacao automatica ao atribuir tarefas</li>
                        <li>• Icone de sino com contador no header</li>
                        <li>• Dropdown com lista de notificacoes</li>
                        <li>• Marcar como lida individualmente ou todas</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-teal-100 text-teal-700 mb-2">Filtros Avancados</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Filtro por repositorio</li>
                        <li>• Filtro por status</li>
                        <li>• Busca por texto</li>
                        <li>• Filtros combinaveis</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-red-100 text-red-700 mb-2">Super Admin Atualizado</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Mesmo padrao visual do desenvolvedor</li>
                        <li>• Header com logo, menu centralizado, notificacoes e perfil</li>
                        <li>• Modais de perfil e configuracoes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Proximas Atualizacoes Planejadas:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tema escuro completo</li>
                    <li>• Notificacoes por email</li>
                    <li>• Dashboard com graficos de produtividade</li>
                    <li>• Exportacao de relatorios em PDF</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
