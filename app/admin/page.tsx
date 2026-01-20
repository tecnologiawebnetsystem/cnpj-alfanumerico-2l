"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isSuperAdmin, logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LogOut, Building2, Users, FileText, BarChart3, Code, 
  User, Settings, Bell, ChevronDown, Mail, Shield, Save 
} from "lucide-react"
import { AdminClientsTab } from "@/components/admin/admin-clients-tab"
import { AdminUsersTab } from "@/components/admin/admin-users-tab"
import { AdminReportsTab } from "@/components/admin/admin-reports-tab"
import { AdminOverview } from "@/components/admin/admin-overview"
import { DocumentationTab } from "@/components/dashboard/documentation-tab"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || !isSuperAdmin()) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Carregando...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header - Same pattern as DevHeader */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center h-14">
            {/* Left - Logo */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
                  ACT
                </div>
                <span className="font-semibold text-sm hidden sm:block">CNPJ Detector</span>
              </Link>
            </div>

            {/* Center - Navigation */}
            <nav className="flex-1 hidden md:flex items-center justify-center gap-1">
              <Button
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setActiveTab("overview")}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Visao Geral
              </Button>
              <Button
                variant={activeTab === "clients" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setActiveTab("clients")}
              >
                <Building2 className="h-3.5 w-3.5" />
                Clientes
              </Button>
              <Button
                variant={activeTab === "users" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-3.5 w-3.5" />
                Usuarios
              </Button>
              <Button
                variant={activeTab === "reports" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setActiveTab("reports")}
              >
                <FileText className="h-3.5 w-3.5" />
                Relatorios
              </Button>
              <Button
                variant={activeTab === "documentacao" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setActiveTab("documentacao")}
              >
                <Code className="h-3.5 w-3.5" />
                Documentacao
              </Button>
            </nav>

            {/* Right - Notifications and Profile */}
            <div className="flex items-center gap-1 min-w-[160px] justify-end">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Bell className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="py-2">
                    <span className="text-sm font-medium">Notificacoes</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="py-8 text-center text-muted-foreground">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <Bell className="h-5 w-5" />
                    </div>
                    <p className="text-xs">Nenhuma notificacao</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1.5 pl-1.5 pr-2 h-8">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-medium leading-none">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Super Admin</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-xs py-1.5 cursor-pointer"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <User className="h-3.5 w-3.5" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 text-xs py-1.5 cursor-pointer"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configuracoes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-xs py-1.5 text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-center gap-1 pb-2 -mt-1 overflow-x-auto">
            <Button
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1 h-7 text-xs px-2 flex-shrink-0"
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="h-3 w-3" />
              Geral
            </Button>
            <Button
              variant={activeTab === "clients" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1 h-7 text-xs px-2 flex-shrink-0"
              onClick={() => setActiveTab("clients")}
            >
              <Building2 className="h-3 w-3" />
              Clientes
            </Button>
            <Button
              variant={activeTab === "users" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1 h-7 text-xs px-2 flex-shrink-0"
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-3 w-3" />
              Usuarios
            </Button>
            <Button
              variant={activeTab === "reports" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1 h-7 text-xs px-2 flex-shrink-0"
              onClick={() => setActiveTab("reports")}
            >
              <FileText className="h-3 w-3" />
              Relatorios
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "clients" && <AdminClientsTab />}
        {activeTab === "users" && <AdminUsersTab />}
        {activeTab === "reports" && <AdminReportsTab />}
        {activeTab === "documentacao" && <DocumentationTab />}
      </div>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Meu Perfil
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie suas informacoes pessoais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {user.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">Super Administrador</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Funcao</p>
                  <p className="text-sm font-medium">Super Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuracoes
            </DialogTitle>
            <DialogDescription>
              Gerencie suas preferencias do sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notificacoes</CardTitle>
                <CardDescription className="text-xs">Configure como deseja receber notificacoes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Novos clientes</p>
                    <p className="text-xs text-muted-foreground">Receber ao cadastrar cliente</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Relatorios</p>
                    <p className="text-xs text-muted-foreground">Relatorios semanais</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Aparencia</CardTitle>
                <CardDescription className="text-xs">Personalize a interface do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tema escuro</p>
                    <p className="text-xs text-muted-foreground">Usar tema escuro</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full gap-2" size="sm">
              <Save className="h-4 w-4" />
              Salvar Configuracoes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
