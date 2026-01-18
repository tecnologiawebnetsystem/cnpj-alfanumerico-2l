"use client"

import { Home, FileText, Users, Settings, Search, BarChart3, BookOpen, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: string
}

export function MobileNav({ activeTab, onTabChange, userRole }: MobileNavProps) {
  const isDev = userRole === "dev"
  const [showMore, setShowMore] = useState(false)

  const devTabs = [
    { value: "overview", label: "Inicio", icon: Home },
    { value: "tarefas", label: "Tarefas", icon: FileText },
    { value: "analises", label: "Analises", icon: Search },
  ]

  const adminMainTabs = [
    { value: "overview", label: "Inicio", icon: Home },
    { value: "analise", label: "Analise", icon: Search },
    { value: "devs", label: "Devs", icon: Users },
    { value: "relatorios", label: "Relat.", icon: BarChart3 },
  ]

  const adminMoreTabs = [
    { value: "configuracoes", label: "Config", icon: Settings },
    { value: "wiki", label: "Wiki", icon: BookOpen },
    { value: "documentacao", label: "Docs", icon: FileText },
  ]

  const mainTabs = isDev ? devTabs : adminMainTabs
  const isMoreActive = !isDev && adminMoreTabs.some(t => t.value === activeTab)

  return (
    <>
      {/* More menu popup */}
      {showMore && !isDev && (
        <div 
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        >
          <div 
            className="absolute bottom-16 right-4 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            {adminMoreTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    onTabChange(tab.value)
                    setShowMore(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="h-14 flex items-center justify-around px-2 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-md transition-colors min-w-0",
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

          {/* More button for admin */}
          {!isDev && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-md transition-colors min-w-0",
                isMoreActive || showMore
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground active:bg-muted"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">Mais</span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
