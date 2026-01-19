"use client"

import { useState } from "react"
import { Home, FileText, Users, Settings, Search, BarChart3, UserPlus, Code, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: string
}

export function MobileNav({ activeTab, onTabChange, userRole }: MobileNavProps) {
  const isDev = userRole === "dev"

  const devTabs = [
    { value: "overview", label: "Inicio", icon: Home },
    { value: "tarefas", label: "Tarefas", icon: FileText },
    { value: "analises", label: "Analises", icon: Search },
  ]

  const adminMainTabs = [
    { value: "overview", label: "Inicio", icon: Home },
    { value: "analise", label: "Analise", icon: Search },
    { value: "atribuicoes", label: "Atrib.", icon: UserPlus },
    { value: "devs", label: "Devs", icon: Users },
    { value: "configuracoes", label: "Config", icon: Settings },
    { value: "documentacao", label: "Docs", icon: Code },
  ]

  const tabs = isDev ? devTabs : adminMainTabs

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="h-14 flex items-center justify-around px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-md transition-colors min-w-0",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground active:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
