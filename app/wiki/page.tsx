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
  Smartphone,
  Zap,
  AlertCircle,
  Monitor,
  ArrowRight,
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
        "Configurar alertas e notificacoes automaticas",
        "Exportar tarefas para Jira/Azure Boards",
        "Visualizar logs de auditoria do cliente",
      ],
      features: [
        {
          title: "Dashboard com Metricas em Tempo Real",
          description: "Graficos de progresso, comparativo antes/depois, taxa de correcao e ranking de repositorios",
        },
        {
          title: "Sistema de Alertas Automaticos",
          description: "Alertas para findings criticos, analises concluidas, tarefas atrasadas e nao atribuidas",
        },
        {
          title: "Assistente IA no Dashboard",
          description: "Chat IA para gerar relatorios, responder perguntas e ajudar na tomada de decisoes",
        },
        {
          title: "Integracao Jira/Azure Boards",
          description: "Exportar tarefas automaticamente como Work Items ou Issues com mapeamento completo",
        },
        {
          title: "Sistema de Auditoria",
          description: "Log completo de todas as acoes: criar, atualizar, excluir, analisar e exportar",
        },
        {
          title: "Gerenciamento de Devs",
          description: "Criar, editar e remover desenvolvedores da equipe",
        },
        {
          title: "Repositorios Git",
          description: "Conectar GitHub/Azure DevOps, visualizar repos e executar analises automaticas",
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
          title: "Relatorios e Exportacao",
          description: "Gerar relatorios PDF/Excel com resumo executivo e detalhes tecnicos",
        },
      ],
    },
    {
      role: "Desenvolvedor (Dev)",
      icon: Code,
      color: "from-green-500 to-emerald-500",
      description: "Executa tarefas usando board Kanban com ferramentas avancadas de produtividade",
      permissions: [
        "Visualizar tasks atribuidas a ele no board Kanban",
        "Mover tasks entre Pendentes, Em Desenvolvimento e Finalizadas",
        "Adicionar commit hash e numero do PR ao finalizar task",
        "Visualizar detalhes completos de cada task incluindo sugestao da IA",
        "Editar controle de horas (estimado, restante, completado)",
        "Receber notificacoes quando tasks sao atribuidas",
        "Visualizar suas proprias metricas, pontos e conquistas",
        "Usar assistente IA para ajuda com codigo",
        "Iniciar modo foco com timer Pomodoro",
      ],
      features: [
        {
          title: "Timer/Cronometro de Trabalho",
          description: "Iniciar/parar cronometro ao trabalhar em tarefa, registra horas automaticamente no banco",
        },
        {
          title: "Assistente IA para Codigo (Ctrl+K)",
          description: "Chat IA que explica codigo, gera correcao automatica e ajuda a entender mudancas necessarias",
        },
        {
          title: "Checklist de Conclusao",
          description: "Antes de finalizar: verificar codigo commitado, PR aberto e testes passando",
        },
        {
          title: "Historico de Atividades",
          description: "Ver todas as tarefas concluidas, tempo gasto e commits feitos",
        },
        {
          title: "Notificacoes em Tempo Real",
          description: "Alertas quando nova tarefa atribuida, prazo proximo ou comentario do admin",
        },
        {
          title: "Diff Viewer Integrado",
          description: "Visualizar codigo antes/depois lado a lado com syntax highlighting",
        },
        {
          title: "Atalhos de Teclado",
          description: "Ctrl+K (IA), Ctrl+F (Foco), Ctrl+1-4 (navegar), ? (ajuda)",
        },
        {
          title: "Modo Foco com Pomodoro",
          description: "Timer 25/5 min, esconde distracoes, som de notificacao ao finalizar",
        },
        {
          title: "Gamificacao",
          description: "Pontos por tarefas, badges de conquistas, ranking entre desenvolvedores",
        },
        {
          title: "Integracao Git",
          description: "Ver branches relacionadas, status do PR e commits da tarefa",
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
                <TabsTrigger value="app">App Mobile/Desktop</TabsTrigger>
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
          {/* APP MOBILE/DESKTOP */}
          <TabsContent value="app" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-green-500" />
                  App para Android, iOS e Desktop
                </CardTitle>
                <CardDescription>
                  Instale o CNPJ Alfanumerico como um aplicativo nativo em qualquer dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Introducao */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    O que e PWA (Progressive Web App)?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    O CNPJ Alfanumerico utiliza tecnologia PWA, que permite instalar o sistema como um 
                    aplicativo nativo em seu dispositivo. Isso significa que voce pode acessar todas as 
                    funcionalidades diretamente da tela inicial, sem precisar abrir o navegador.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">Rapido</h4>
                      <p className="text-sm text-muted-foreground">Carrega instantaneamente</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Seguro</h4>
                      <p className="text-sm text-muted-foreground">Conexao HTTPS</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-2">
                        <Download className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium">Instalavel</h4>
                      <p className="text-sm text-muted-foreground">Na tela inicial</p>
                    </div>
                  </div>
                </div>

                {/* Android */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Android</h3>
                      <p className="text-green-100 text-sm">Chrome ou navegador compativel</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <ol className="space-y-4">
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center flex-shrink-0">1</div>
                        <div>
                          <p className="font-medium">Abra o site no Chrome</p>
                          <p className="text-sm text-muted-foreground">Acesse o endereco do sistema no navegador Chrome</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center flex-shrink-0">2</div>
                        <div>
                          <p className="font-medium">Toque no menu (3 pontos)</p>
                          <p className="text-sm text-muted-foreground">No canto superior direito da tela</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center flex-shrink-0">3</div>
                        <div>
                          <p className="font-medium">Selecione "Adicionar a tela inicial"</p>
                          <p className="text-sm text-muted-foreground">Ou "Instalar aplicativo" se disponivel</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center flex-shrink-0">4</div>
                        <div>
                          <p className="font-medium">Confirme a instalacao</p>
                          <p className="text-sm text-muted-foreground">O icone do app aparecera na sua tela inicial</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* iOS */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">iOS (iPhone/iPad)</h3>
                      <p className="text-gray-300 text-sm">Safari obrigatorio</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Importante:</strong> No iOS, voce DEVE usar o Safari. Outros navegadores (Chrome, Firefox) nao suportam instalacao de PWA no iPhone/iPad.
                      </p>
                    </div>
                    <ol className="space-y-4">
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">1</div>
                        <div>
                          <p className="font-medium">Abra o site no Safari</p>
                          <p className="text-sm text-muted-foreground">Navegador nativo da Apple</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">2</div>
                        <div>
                          <p className="font-medium">Toque no botao Compartilhar</p>
                          <p className="text-sm text-muted-foreground">Icone de quadrado com seta para cima (parte inferior da tela)</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">3</div>
                        <div>
                          <p className="font-medium">Role e selecione "Adicionar a Tela de Inicio"</p>
                          <p className="text-sm text-muted-foreground">Pode precisar rolar a lista de opcoes</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">4</div>
                        <div>
                          <p className="font-medium">Toque em "Adicionar"</p>
                          <p className="text-sm text-muted-foreground">O app sera instalado na tela inicial</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Desktop */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Windows / macOS / Linux</h3>
                      <p className="text-blue-100 text-sm">Chrome ou Microsoft Edge</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">C</span>
                          </div>
                          Google Chrome
                        </h4>
                        <ol className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">1.</span>
                            <span>Acesse o site no Chrome</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">2.</span>
                            <span>Clique no icone de instalar na barra de endereco (lado direito)</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">3.</span>
                            <span>Ou: Menu (3 pontos) → "Instalar CNPJ App"</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">4.</span>
                            <span>Confirme clicando em "Instalar"</span>
                          </li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">E</span>
                          </div>
                          Microsoft Edge
                        </h4>
                        <ol className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">1.</span>
                            <span>Acesse o site no Edge</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">2.</span>
                            <span>Clique no icone de instalar na barra de endereco</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">3.</span>
                            <span>Ou: Menu (3 pontos) → "Aplicativos" → "Instalar"</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500 font-medium">4.</span>
                            <span>Confirme a instalacao</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beneficios */}
                <div className="bg-muted/50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Beneficios do App Instalado</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Acesso Direto</p>
                        <p className="text-sm text-muted-foreground">Abra direto da tela inicial, sem digitar URL</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Tela Cheia</p>
                        <p className="text-sm text-muted-foreground">Sem barra de navegador, mais espaco util</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Carregamento Rapido</p>
                        <p className="text-sm text-muted-foreground">Recursos em cache para acesso instantaneo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Notificacoes</p>
                        <p className="text-sm text-muted-foreground">Receba alertas mesmo com o app fechado</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <Link href="/download">
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <Download className="h-5 w-5" />
                      Ver Instrucoes Detalhadas
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
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
                {/* Janeiro 2026 - Novas Funcionalidades */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Badge className="bg-blue-500">NOVO</Badge>
                    Janeiro 2026 - Admin Cliente
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-blue-100 text-blue-700 mb-2">Dashboard com Metricas</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Cards com total de CNPJs, tarefas pendentes e concluidas</li>
                        <li>• Grafico de evolucao mensal das correcoes</li>
                        <li>• Taxa de correcao (antes/depois)</li>
                        <li>• Ranking de repositorios por findings</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-amber-100 text-amber-700 mb-2">Sistema de Alertas</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Alertas automaticos para findings criticos</li>
                        <li>• Notificacao quando analise e concluida</li>
                        <li>• Alerta de tarefas atrasadas</li>
                        <li>• Configuracao de regras de alerta</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-purple-100 text-purple-700 mb-2">Assistente IA</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Chat IA integrado no dashboard</li>
                        <li>• Gerar relatorios automaticos</li>
                        <li>• Responder duvidas sobre o sistema</li>
                        <li>• Ajudar na tomada de decisoes</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-cyan-100 text-cyan-700 mb-2">Integracao Jira/Azure Boards</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Exportar tarefas como Work Items no Azure</li>
                        <li>• Exportar tarefas como Issues no Jira</li>
                        <li>• Mapeamento de prioridade e descricao</li>
                        <li>• Salva referencia externa na tarefa</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-slate-100 text-slate-700 mb-2">Sistema de Auditoria</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Log de todas as acoes (criar, editar, excluir)</li>
                        <li>• Filtros por acao, entidade e usuario</li>
                        <li>• Exportacao CSV dos logs</li>
                        <li>• Historico completo com timestamps</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Desenvolvedor */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Badge className="bg-green-500">NOVO</Badge>
                    Janeiro 2026 - Desenvolvedor
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-green-100 text-green-700 mb-2">Timer de Trabalho</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Cronometro para registrar tempo em tarefas</li>
                        <li>• Iniciar/pausar/parar com um clique</li>
                        <li>• Salva automaticamente no banco de dados</li>
                        <li>• Historico de sessoes de trabalho</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-purple-100 text-purple-700 mb-2">Assistente IA (Ctrl+K)</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Chat IA para ajuda com codigo</li>
                        <li>• Explica o codigo atual e sugerido</li>
                        <li>• Gera correcoes automaticamente</li>
                        <li>• Responde duvidas tecnicas</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-orange-100 text-orange-700 mb-2">Checklist de Conclusao</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Verificar codigo commitado</li>
                        <li>• Verificar PR aberto</li>
                        <li>• Verificar testes passando</li>
                        <li>• Bloqueio de finalizacao ate completar</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-blue-100 text-blue-700 mb-2">Modo Foco (Ctrl+F)</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Timer Pomodoro (25min trabalho / 5min pausa)</li>
                        <li>• Tela limpa sem distracoes</li>
                        <li>• Som de notificacao ao finalizar</li>
                        <li>• Estatisticas de sessoes focadas</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-amber-100 text-amber-700 mb-2">Gamificacao</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Pontos por tarefas concluidas</li>
                        <li>• Badges e conquistas desbloqueiaveis</li>
                        <li>• Ranking entre desenvolvedores</li>
                        <li>• Nivel e progresso visual</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-teal-100 text-teal-700 mb-2">Atalhos de Teclado</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Ctrl+K - Abrir Assistente IA</li>
                        <li>• Ctrl+F - Modo Foco</li>
                        <li>• Ctrl+1/2/3/4 - Navegar entre abas</li>
                        <li>• ? - Mostrar ajuda de atalhos</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-indigo-100 text-indigo-700 mb-2">Diff Viewer e Git</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Visualizar codigo antes/depois lado a lado</li>
                        <li>• Syntax highlighting por linguagem</li>
                        <li>• Ver branches e PRs relacionados</li>
                        <li>• Status do PR em tempo real</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Versao Anterior */}
                <div className="border-l-4 border-gray-300 pl-4 opacity-70">
                  <h4 className="font-semibold text-lg mb-2">Dezembro 2025</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-gray-100 text-gray-700 mb-2">Board Kanban</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Drag-and-drop entre colunas</li>
                        <li>• Modal de detalhes completo</li>
                        <li>• Controle de horas estilo Azure DevOps</li>
                      </ul>
                    </div>

                    <div>
                      <Badge className="bg-gray-100 text-gray-700 mb-2">Sistema Base</Badge>
                      <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                        <li>• Header padronizado</li>
                        <li>• Notificacoes basicas</li>
                        <li>• Filtros por repositorio e status</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Proximas Atualizacoes Planejadas
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tema escuro completo</li>
                    <li>• Notificacoes por email e Slack</li>
                    <li>• Dashboard executivo para C-Level</li>
                    <li>• Integracao com GitLab</li>
                    <li>• App mobile para desenvolvedores</li>
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
