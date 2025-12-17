"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isSuperAdmin, logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Building2, Users, FileText, BarChart3 } from "lucide-react"
import { AdminClientsTab } from "@/components/admin/admin-clients-tab"
import { AdminUsersTab } from "@/components/admin/admin-users-tab"
import { AdminReportsTab } from "@/components/admin/admin-reports-tab"
import { AdminOverview } from "@/components/admin/admin-overview"
import Image from "next/image"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || !isSuperAdmin()) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary/10 to-slate-900">
        <div className="text-primary">Carregando...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50">
      <div className="border-b bg-gradient-to-r from-primary to-primary/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/act-logo-square.jfif"
                alt="ACT Digital"
                width={48}
                height={48}
                className="rounded-xl shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Super Admin</h1>
                <p className="text-sm text-primary-foreground/80">Controle Total do Sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-primary-foreground/80">{user.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border-none shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="clients">
            <AdminClientsTab />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
