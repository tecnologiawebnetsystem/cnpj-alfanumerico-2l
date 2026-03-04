"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Database, BarChart3, FileText } from "lucide-react"

export default function AdminClientPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (currentUser.role.toUpperCase() !== "ADMIN_CLIENT") {
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50">
      <div className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Cliente</h1>
                <p className="text-primary-foreground/80">{user?.name || user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">Gerencie sua equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-primary hover:bg-slate-100">Acessar</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/80 to-primary/60 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Repositórios
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">Seus repositórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-primary hover:bg-slate-100">Acessar</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/70 to-primary/50 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análises
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">Visualize análises</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-primary hover:bg-slate-100">Acessar</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/60 to-primary/40 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">Gere relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-primary hover:bg-slate-100">Acessar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
