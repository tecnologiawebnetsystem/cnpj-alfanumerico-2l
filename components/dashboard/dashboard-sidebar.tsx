"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileSearch,
  CheckSquare,
  Settings,
  Users,
  BarChart3,
  Zap,
  Bell,
  Calendar,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Code2,
  BookOpen,
  FileText,
  AlertTriangle,
  HardDrive,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Logo } from "@/components/landing/logo"

interface DashboardSidebarProps {
  user?: any
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const userRole = user?.role || "dev"
  const isAdmin = userRole === "admin" || userRole === "super_admin"
  const isSuperAdmin = userRole === "super_admin"

  const navigation = [
    {
      title: "Principal",
      items: [
        {
          title: "Visão Geral",
          href: "/dashboard",
          icon: LayoutDashboard,
          description: "Resumo das suas atividades",
        },
        {
          title: "Análises",
          href: "/analyzer",
          icon: FileSearch,
          description: "Analisar CNPJs",
        },
        {
          title: "Tarefas",
          href: "/dashboard",
          icon: CheckSquare,
          description: "Gerenciar suas tarefas",
          badge: "3",
        },
      ],
    },
    {
      title: "Worker Local",
      items: [
        {
          title: "Status do Worker",
          href: "/worker/status",
          icon: HardDrive,
          description: "Monitorar worker local",
          badge: "Novo",
          badgeVariant: "secondary" as const,
        },
        {
          title: "Logs do Worker",
          href: "/worker/logs",
          icon: Terminal,
          description: "Ver logs em tempo real",
        },
      ],
    },
    {
      title: "Documentação",
      items: [
        {
          title: "API Docs",
          href: "/api-docs",
          icon: Code2,
          description: "Swagger API Documentation",
          badge: "Novo",
          badgeVariant: "secondary" as const,
        },
        {
          title: "Wiki",
          href: "/wiki",
          icon: BookOpen,
          description: "Base de conhecimento",
        },
      ],
    },
    ...(userRole === "dev"
      ? [
          {
            title: "Relatórios",
            items: [
              {
                title: "Meus Relatórios",
                href: "/reports",
                icon: FileText,
                description: "Relatórios gerenciais",
              },
            ],
          },
        ]
      : []),
    {
      title: "Gestão Ágil",
      items: [
        {
          title: "Sprints",
          href: "/dashboard/sprints",
          icon: Calendar,
          description: "Board de Sprints",
          badge: "Novo",
          badgeVariant: "secondary" as const,
        },
      ],
    },
    {
      title: "Insights",
      items: [
        {
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          description: "Métricas e relatórios",
        },
        {
          title: "Atividades",
          href: "/dashboard/activity",
          icon: Zap,
          description: "Histórico de ações",
        },
        {
          title: "Gamificação",
          href: "/dashboard/gamification",
          icon: Trophy,
          description: "Conquistas e ranking",
        },
      ],
    },
    {
      title: "Configurações",
      items: [
        {
          title: "Notificações",
          href: "/dashboard/notifications",
          icon: Bell,
          description: "Gerenciar alertas",
        },
        {
          title: "Configurações",
          href: "/dashboard/settings",
          icon: Settings,
          description: "Preferências do sistema",
        },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: "Sistema",
            items: [
              {
                title: "Logs de Erros",
                href: "/admin/errors",
                icon: AlertTriangle,
                description: "Monitoramento de erros",
                badge: "Sistema",
                badgeVariant: "destructive" as const,
              },
            ],
          },
        ]
      : []),
  ]

  if (isSuperAdmin) {
    navigation.push({
      title: "Administração",
      items: [
        {
          title: "Painel Admin",
          href: "/admin",
          icon: Users,
          description: "Gerenciar clientes",
        },
      ],
    })
  }

  return (
    <aside className={cn("border-r bg-sidebar transition-all duration-300 shadow-sm", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b bg-card/50">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Logo className="h-6 transition-transform group-hover:scale-105" />
              <span className="text-sm font-semibold tracking-tight">Aegis CNPJ</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hover:bg-accent/50"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-8">
          {navigation.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="mb-3 px-3 text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-widest">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-primary text-primary-foreground shadow-sm",
                        collapsed && "justify-center",
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-sm")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant={item.badgeVariant || "default"} className="text-[0.65rem] px-1.5 py-0">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info */}
        {!collapsed && user && (
          <>
            <Separator />
            <div className="p-4 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.role === "super_admin"
                      ? "Super Admin"
                      : user.role === "admin"
                        ? "Admin"
                        : user.role === "scrum_master"
                          ? "Scrum Master"
                          : user.role === "product_owner"
                            ? "Product Owner"
                            : "Desenvolvedor"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
