"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Shield, Lock, Mail, Database, GitBranch, CheckCircle } from 'lucide-react'
import { LogoIcon } from "@/components/landing/logo"
import Link from "next/link"
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdminRoute = searchParams.get("admin") === "true"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] === FORM SUBMIT START ===")
    setLoading(true)
    setError("")

    try {
      console.log("[v0] Calling login function...")
      const result = await login(formData.email, formData.password)
      console.log("[v0] Login function returned:", result)

      if (result.success && result.user) {
        console.log("[v0] Login successful, redirecting...")
        const userRole = result.user.role.toUpperCase()
        console.log("[v0] User role (uppercase):", userRole)

        if (userRole === "SUPER_ADMIN" || userRole === "SUPER ADMIN") {
          console.log("[v0] Redirecting to /admin")
          router.push("/admin")
        } else if (userRole === "ADMIN_CLIENT" || userRole === "ADMIN") {
          console.log("[v0] Redirecting to /dashboard")
          router.push("/dashboard")
        } else if (userRole === "DEV" || userRole === "DEVELOPER") {
          console.log("[v0] Redirecting to /tasks")
          router.push("/tasks")
        } else {
          console.log("[v0] Unknown role, redirecting to /dashboard")
          router.push("/dashboard")
        }
      } else {
        console.error("[v0] Login failed:", result.error)
        setError(result.error || "Erro ao fazer login")
        setLoading(false)
      }
    } catch (error) {
      console.error("[v0] === FORM SUBMIT EXCEPTION ===")
      console.error("[v0] Error:", error)
      setError(error instanceof Error ? error.message : "Erro inesperado")
      setLoading(false)
    }
    
    console.log("[v0] === FORM SUBMIT END ===")
  }

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-950 flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="max-w-md mx-auto space-y-8 relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-2 ring-blue-400/20">
                <Shield className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Super Admin</h1>
                <p className="text-blue-200/80">Controle Total do Sistema</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Suas Permissões:</h2>
              <div className="space-y-3">
                {[
                  { title: "Gerenciamento de Clientes", desc: "Criar, editar e remover clientes do sistema" },
                  { title: "Controle de Licenças", desc: "Ativar, desativar e gerenciar licenças de acesso" },
                  { title: "Gerenciamento de Usuários", desc: "Criar admins, devs e gerenciar permissões" },
                ].map((perm, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-blue-950/40 border border-blue-700/30 backdrop-blur-sm hover:bg-blue-900/40 hover:border-blue-600/40 transition-all duration-200 cursor-default">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium text-sm">{perm.title}</p>
                      <p className="text-sm text-blue-200/60">{perm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-2 ring-blue-400/20">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white tracking-tight">Acesso Administrativo</CardTitle>
                  <CardDescription className="text-slate-300 mt-2">Entre com suas credenciais de Super Admin</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 font-medium">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@webnetsystems.com.br"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10 bg-slate-900/80 border-slate-600 text-white placeholder:text-slate-500 h-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pl-10 bg-slate-900/80 border-slate-600 text-white h-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Autenticando...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Entrar como Super Admin
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors duration-200">
                {"← Voltar para o site"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900" />
      <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:shadow-2xl group-hover:shadow-blue-600/40 group-hover:scale-105 transition-all duration-300 ring-2 ring-blue-400/20">
                <LogoIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">CNPJ Detector</h1>
                <p className="text-sm text-muted-foreground">Sistema de Análise Inteligente</p>
              </div>
            </Link>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md font-light">
              Análise automatizada de repositórios com tecnologia de ponta para garantir conformidade e segurança.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Database, title: "Análise Inteligente", desc: "IA avançada para análise de código", color: "from-blue-100 to-blue-200 dark:from-blue-950/50 dark:to-blue-900/50", iconColor: "text-blue-600 dark:text-blue-400" },
              { icon: GitBranch, title: "Integração Git", desc: "GitHub, GitLab e Azure DevOps", color: "from-cyan-100 to-cyan-200 dark:from-cyan-950/50 dark:to-cyan-900/50", iconColor: "text-cyan-600 dark:text-cyan-400" },
              { icon: Shield, title: "Segurança Total", desc: "Compliance e auditoria completa", color: "from-emerald-100 to-emerald-200 dark:from-emerald-950/50 dark:to-emerald-900/50", iconColor: "text-emerald-600 dark:text-emerald-400" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-accent/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group cursor-default">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-200 ring-1 ring-black/5`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <Card className="border shadow-2xl backdrop-blur-sm bg-card/95 ring-1 ring-black/5">
            <CardHeader className="space-y-3 text-center pb-6">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-600/30 ring-2 ring-blue-400/20 lg:hidden">
                <LogoIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Acesse sua conta</CardTitle>
                <CardDescription className="mt-2 text-base">Entre com suas credenciais corporativas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail corporativo</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="pl-10 h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-10 h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-200 font-medium text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    "Entrar no Sistema"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Sistema seguro com autenticação corporativa
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1">
              {"← Voltar para o site"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
