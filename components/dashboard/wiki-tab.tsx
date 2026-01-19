"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Shield, 
  Code, 
  Settings, 
  FileSearch, 
  GitBranch, 
  BarChart3, 
  Bell, 
  Database,
  Brain,
  CheckCircle2,
  ArrowRight,
  Building2,
  UserCog,
  Laptop
} from "lucide-react"

interface RoleInfo {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  permissions: string[]
  features: {
    title: string
    description: string
    icon: React.ElementType
  }[]
}

const roles: RoleInfo[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Administrador geral do sistema com acesso total a todas as funcionalidades e clientes",
    icon: Shield,
    color: "bg-red-100 text-red-700 border-red-200",
    permissions: [
      "Gerenciar todos os clientes",
      "Criar e editar licencas",
      "Acessar metricas globais",
      "Configurar parametros do sistema",
      "Gerenciar todos os usuarios",
      "Visualizar logs de auditoria",
      "Configurar integracoes globais"
    ],
    features: [
      {
        title: "Gestao de Clientes",
        description: "Cadastrar novos clientes, definir planos, gerenciar licencas e limites de uso",
        icon: Building2
      },
      {
        title: "Monitoramento Global",
        description: "Dashboard com visao geral de todos os clientes, analises e uso do sistema",
        icon: BarChart3
      },
      {
        title: "Configuracoes Avancadas",
        description: "Definir parametros globais, configurar IA, gerenciar integraces",
        icon: Settings
      },
      {
        title: "Auditoria",
        description: "Visualizar logs de acesso, alteracoes e acoes de todos os usuarios",
        icon: FileSearch
      }
    ]
  },
  {
    id: "admin_client",
    name: "Admin Cliente",
    description: "Administrador do cliente responsavel por gerenciar desenvolvedores e analises da empresa",
    icon: UserCog,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    permissions: [
      "Gerenciar desenvolvedores da empresa",
      "Iniciar analises de repositorios",
      "Atribuir tarefas a desenvolvedores",
      "Visualizar relatorios da empresa",
      "Configurar integracoes Git",
      "Configurar IA para analises",
      "Exportar relatorios"
    ],
    features: [
      {
        title: "Visao Geral",
        description: "Dashboard com estatisticas de tarefas, desenvolvedores ativos e progresso geral",
        icon: BarChart3
      },
      {
        title: "Analise de Repositorios",
        description: "Selecionar repositorios, iniciar analises com IA, visualizar findings detalhados",
        icon: GitBranch
      },
      {
        title: "Atribuicao de Tarefas",
        description: "Visualizar repositorios analisados e atribuir desenvolvedores para correcoes",
        icon: Users
      },
      {
        title: "Gestao de Desenvolvedores",
        description: "Cadastrar, ativar/desativar e monitorar desenvolvedores da equipe",
        icon: UserCog
      },
      {
        title: "Relatorios",
        description: "Gerar relatorios de analise, comparativos, evolucao e exportar em PDF/CSV",
        icon: FileSearch
      },
      {
        title: "Configuracoes",
        description: "Configurar campos CNPJ, extensoes de arquivo, integracoes Git e IA",
        icon: Settings
      }
    ]
  },
  {
    id: "developer",
    name: "Desenvolvedor",
    description: "Membro da equipe de desenvolvimento responsavel por corrigir os findings identificados",
    icon: Laptop,
    color: "bg-green-100 text-green-700 border-green-200",
    permissions: [
      "Visualizar tarefas atribuidas",
      "Atualizar status das tarefas",
      "Visualizar codigo sugerido",
      "Marcar tarefas como concluidas",
      "Visualizar analise da IA",
      "Acessar historico de tarefas"
    ],
    features: [
      {
        title: "Minhas Tarefas",
        description: "Lista de tarefas atribuidas com detalhes do arquivo, linha e codigo a corrigir",
        icon: CheckCircle2
      },
      {
        title: "Detalhes do Codigo",
        description: "Visualizar codigo atual, codigo sugerido pela IA e explicacao da correcao",
        icon: Code
      },
      {
        title: "Analise IA",
        description: "Ver explicacao detalhada da IA sobre o problema e a solucao proposta",
        icon: Brain
      },
      {
        title: "Atualizacao de Status",
        description: "Marcar tarefas como em andamento, concluidas ou solicitar revisao",
        icon: CheckCircle2
      }
    ]
  }
]

export function WikiTab() {
  const [selectedRole, setSelectedRole] = useState("admin_client")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Wiki do Sistema</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Documentacao dos perfis de usuario e suas funcionalidades
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <Card 
              key={role.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === role.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${role.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{role.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {role.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Role Details */}
      {roles.filter(r => r.id === selectedRole).map((role) => {
        const Icon = role.icon
        return (
          <div key={role.id} className="space-y-6">
            {/* Role Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${role.color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{role.name}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Permissions & Features */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Permissoes
                  </CardTitle>
                  <CardDescription>O que este perfil pode fazer no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.permissions.map((permission, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Funcionalidades
                  </CardTitle>
                  <CardDescription>Areas e recursos disponiveis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {role.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FeatureIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      })}

      {/* System Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Fluxo de Trabalho do Sistema
          </CardTitle>
          <CardDescription>Como os perfis interagem no processo de analise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
            {[
              { step: "1", title: "Admin configura", desc: "Repositorios e IA", icon: Settings },
              { step: "2", title: "Inicia analise", desc: "Clone e scan", icon: GitBranch },
              { step: "3", title: "IA analisa", desc: "Findings gerados", icon: Brain },
              { step: "4", title: "Atribui tarefas", desc: "Para devs", icon: Users },
              { step: "5", title: "Dev corrige", desc: "Codigo atualizado", icon: Code },
              { step: "6", title: "Relatorio", desc: "Exporta resultados", icon: FileSearch },
            ].map((item, idx, arr) => {
              const StepIcon = item.icon
              return (
                <div key={idx} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <StepIcon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="mb-1">{item.step}</Badge>
                    <span className="text-xs font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
