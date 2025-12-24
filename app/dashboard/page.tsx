"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, ListTodo, FileText, BarChart3, Settings, Search } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { ClientOverview } from "@/components/dashboard/client-overview-tab"
import { ClientDevsTab } from "@/components/dashboard/client-devs-tab"
import { ClientTasksTab } from "@/components/dashboard/client-tasks-tab"
import { ClientReportsTab } from "@/components/dashboard/client-reports-tab"
import { ClientSettingsTab } from "@/components/dashboard/client-settings-tab"
import { ClientAnalysesTab } from "@/components/dashboard/client-analyses-tab"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (!currentUser) {
      router.push("/login")
      return
    }

    if (currentUser.role === "dev") {
      router.push("/tasks")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const userRole = user?.role || "admin"
  const isAdmin = userRole === "admin"

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 lg:pb-8">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-4 md:py-6 lg:py-8 max-w-[1400px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden md:inline-flex md:flex-wrap md:h-auto lg:h-10 w-full md:w-auto md:max-w-full lg:max-w-none mx-auto mb-6 md:mb-6 lg:mb-8 md:gap-2 lg:gap-0 md:p-2 lg:p-1">
            <TabsTrigger value="overview" className="md:flex-1 lg:flex-initial md:min-w-[140px] lg:min-w-0">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="analises" className="md:flex-1 lg:flex-initial md:min-w-[140px] lg:min-w-0">
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Análises</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="md:flex-1 lg:flex-initial md:min-w-[140px] lg:min-w-0">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="devs" className="md:flex-1 lg:flex-initial md:min-w-[140px] lg:min-w-0">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Desenvolvedores</span>
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="md:flex-1 lg:flex-initial md:min-w-[140px] lg:min-w-0">
              <ListTodo className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Tarefas</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="md:flex-1 lg:flex-initial md:min-w-[140px] lg:min-w-0">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ClientOverview onChangeTab={setActiveTab} userRole={userRole} />
          </TabsContent>

          <TabsContent value="analises">
            <ClientAnalysesTab clientId={user.client_id} />
          </TabsContent>

          <TabsContent value="configuracoes">
            <ClientSettingsTab clientId={user.client_id} />
          </TabsContent>

          <TabsContent value="devs">
            <ClientDevsTab clientId={user.client_id} />
          </TabsContent>

          <TabsContent value="tarefas">
            <ClientTasksTab clientId={user.client_id} />
          </TabsContent>

          <TabsContent value="relatorios">
            <ClientReportsTab clientId={user.client_id} />
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} userRole={userRole} />
    </div>
  )
}
