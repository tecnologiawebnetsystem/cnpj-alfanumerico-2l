"use client"

import { Home, CheckSquare, FileText, FileBarChart, Users, Settings, Search } from 'lucide-react'
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: string
}

export function MobileNav({ activeTab, onTabChange, userRole }: MobileNavProps) {
  const isDev = userRole === "dev"

  const devTabs = [
    { value: "overview", label: "Início", icon: Home },
    { value: "tarefas", label: "Tarefas", icon: CheckSquare },
    { value: "analises", label: "Análises", icon: FileText },
  ]

  const adminTabs = [
    { value: "overview", label: "Início", icon: Home },
    { value: "analises", label: "Análises", icon: Search },
    { value: "configuracoes", label: "Config", icon: Settings },
    { value: "devs", label: "Devs", icon: Users },
    { value: "tarefas", label: "Tarefas", icon: CheckSquare },
    { value: "relatorios", label: "Relatórios", icon: FileText },
  ]

  const tabs = isDev ? devTabs : adminTabs

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className={cn("h-16", isDev ? "grid grid-cols-3" : "grid grid-cols-6")}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
