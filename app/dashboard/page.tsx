"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Loader2, Users, FileText, BarChart3, Settings, Search, UserPlus, BookOpen, Code } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { ClientOverview } from "@/components/dashboard/client-overview-tab"
import { ClientDevsTab } from "@/components/dashboard/client-devs-tab"
import { ClientReportsTab } from "@/components/dashboard/client-reports-tab"
import { ClientSettingsTab } from "@/components/dashboard/client-settings-tab"
import { ClientAnalysesTab } from "@/components/dashboard/client-analyses-tab"
import { DeveloperAssignmentTab } from "@/components/dashboard/developer-assignment-tab"
import { WikiTab } from "@/components/dashboard/wiki-tab"
import { DocumentationTab } from "@/components/dashboard/documentation-tab"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "overview", label: "Visao Geral", icon: BarChart3 },
  { id: "analise", label: "Analise", icon: Search },
  { id: "atribuicoes", label: "Atribuicoes", icon: UserPlus },
  { id: "devs", label: "Desenvolvedores", icon: Users },
  { id: "relatorios", label: "Relatorios", icon: FileText },
  { id: "configuracoes", label: "Configuracoes", icon: Settings },
  { id: "wiki", label: "Wiki", icon: BookOpen },
  { id: "documentacao", label: "Documentacao", icon: Code },
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (!currentUser) {
      router.push("/")
      return
    }

    const normalizedRole = currentUser.role?.toLowerCase() || ""

    if (normalizedRole === "dev" || normalizedRole === "developer") {
      router.push("/dev/assignments")
      return
    }

    setUser({
      ...currentUser,
      role: normalizedRole,
    })
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userRole = user?.role || "admin"

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ClientOverview onChangeTab={setActiveTab} userRole={userRole} />
      case "analise":
        return <ClientAnalysesTab clientId={user.client_id} />
      case "atribuicoes":
        return <DeveloperAssignmentTab clientId={user.client_id} />
      case "devs":
        return <ClientDevsTab clientId={user.client_id} />
      case "relatorios":
        return <ClientReportsTab clientId={user.client_id} />
      case "configuracoes":
        return <ClientSettingsTab clientId={user.client_id} />
      case "wiki":
        return <WikiTab />
      case "documentacao":
        return <DocumentationTab />
      default:
        return <ClientOverview onChangeTab={setActiveTab} userRole={userRole} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card min-h-[calc(100vh-65px)] sticky top-[65px]">
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          {/* Tab Navigation - Tablet */}
          <div className="hidden md:flex lg:hidden border-b border-border bg-card sticky top-[65px] z-10 overflow-x-auto">
            <div className="flex px-4 py-2 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} userRole={userRole} />
    </div>
  )
}
