"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Zap,
  Award,
  CheckCircle,
  Code,
  Database,
  Menu,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function HeroSection() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("[v0] Starting login for:", email)

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: include cookies in request/response
      })

      const data = await res.json()
      console.log("[v0] Login response:", { success: data.success, hasUser: !!data.user })

      if (data.success && data.user) {
        const normalizedUser = {
          ...data.user,
          role: data.user.role?.toLowerCase() || "user",
        }

        localStorage.setItem("user", JSON.stringify(normalizedUser))

        if (data.sessionToken) {
          localStorage.setItem("sessionToken", data.sessionToken)
        }

        toast.success("Login realizado com sucesso!")
        console.log("[v0] Login successful, redirecting. Role:", normalizedUser.role)

        await new Promise((resolve) => setTimeout(resolve, 100))

        const role = normalizedUser.role
        if (role === "super_admin") {
          router.push("/admin")
        } else if (role === "dev" || role === "developer") {
          router.push("/dev/assignments")
        } else {
          // admin, admin_client, and others go to dashboard
          router.push("/dashboard")
        }
      } else {
        setError(data.error || "Credenciais inválidas")
        toast.error(data.error || "Credenciais inválidas")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Erro ao conectar com o servidor")
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FFF5E6] to-[#FFE4C4]" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#FFD4A3]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#0052CC]/5 to-transparent" />
      </div>

      <header className="relative z-50 pt-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-md">
                <Image
                  src="/images/act-logo-horizontal.jpeg"
                  alt="ACT Digital"
                  width={100}
                  height={40}
                  className="rounded"
                  priority
                />
              </div>
              <div className="hidden sm:block border-l-2 border-[#0052CC]/20 pl-4">
                <h1 className="text-lg font-bold text-gray-800">CNPJ Alfanumérico</h1>
                <p className="text-xs text-gray-500">Powered by AI</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("solucao")}
                className="text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors"
              >
                Solucao
              </button>
              <button
                onClick={() => scrollToSection("validador")}
                className="text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors"
              >
                Validador
              </button>
              <button
                onClick={() => scrollToSection("exemplos")}
                className="text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors"
              >
                Exemplos
              </button>
              <Link
                href="/wiki"
                className="text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Wiki
              </Link>
              <button
                onClick={() => scrollToSection("login")}
                className="px-5 py-2.5 bg-[#0052CC] text-white rounded-lg font-medium text-sm hover:bg-[#0052CC]/90 transition-all shadow-md hover:shadow-lg"
              >
                Entrar
              </button>
            </nav>

            <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 bg-white rounded-lg shadow-xl mt-4 p-4">
              <button
                onClick={() => scrollToSection("solucao")}
                className="block w-full text-left text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors py-2"
              >
                Solução
              </button>
              <button
                onClick={() => scrollToSection("validador")}
                className="block w-full text-left text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors py-2"
              >
                Validador
              </button>
              <button
                onClick={() => scrollToSection("exemplos")}
                className="block w-full text-left text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors py-2"
              >
                Exemplos
              </button>
              <button
                onClick={() => scrollToSection("login")}
                className="block w-full text-center bg-[#0052CC] text-white rounded-lg font-medium text-sm py-3 hover:bg-[#0052CC]/90 transition-colors"
              >
                Entrar
              </button>
            </nav>
          )}
        </div>
      </header>

      <div className="container relative mx-auto px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <Badge className="gap-2 bg-[#0052CC]/10 border-[#0052CC]/20 text-[#0052CC] font-medium">
              <AlertCircle className="h-3 w-3" />
              Obrigatório a partir de Julho/2026
            </Badge>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight">
                <span className="text-gray-900">CNPJ</span> <span className="text-[#E67E22]">Alfanumérico</span>
              </h2>
              <p className="text-xl md:text-2xl font-medium text-[#0052CC]">Powered by AI</p>
            </div>

            <p className="text-lg text-gray-600 text-balance leading-relaxed max-w-xl">
              Solução completa de <span className="font-semibold text-gray-800">Inteligência Artificial</span> para
              adaptar sua empresa ao novo formato de CNPJ alfanumérico da Receita Federal.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0052CC]/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#0052CC]" />
                </div>
                <div>
                  <span className="text-gray-800 font-medium">Análise automática de repositórios</span>
                  <p className="text-sm text-gray-500">GitHub, GitLab e Azure DevOps</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E67E22]/10 flex items-center justify-center">
                  <Code className="h-6 w-6 text-[#E67E22]" />
                </div>
                <div>
                  <span className="text-gray-800 font-medium">Sugestões de correção com IA</span>
                  <p className="text-sm text-gray-500">Soluções inteligentes e automáticas</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#27AE60]/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-[#27AE60]" />
                </div>
                <div>
                  <span className="text-gray-800 font-medium">Scan de bancos de dados</span>
                  <p className="text-sm text-gray-500">SQL Server e Oracle</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-5 rounded-xl bg-white shadow-sm border border-gray-100">
                <Shield className="h-7 w-7 text-[#0052CC] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">100% Seguro</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-white shadow-sm border border-gray-100">
                <Zap className="h-7 w-7 text-[#E67E22] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Análise IA</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-white shadow-sm border border-gray-100">
                <Award className="h-7 w-7 text-[#27AE60] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Certificado</p>
              </div>
            </div>
          </div>

          <div id="login" className="lg:sticky lg:top-24">
            <Card className="p-8 md:p-10 shadow-xl border border-gray-100 bg-white">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#0052CC] to-[#0052CC]/80 mb-4 shadow-lg">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">Acesse sua Conta</h2>
                  <p className="text-sm text-gray-500">Entre com suas credenciais corporativas</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-[#0052CC]" />
                      E-mail Corporativo
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-[#0052CC] focus:ring-[#0052CC] bg-gray-50/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                      <Lock className="h-4 w-4 text-[#0052CC]" />
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-[#0052CC] focus:ring-[#0052CC] bg-gray-50/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold bg-[#0052CC] hover:bg-[#0052CC]/90 text-white shadow-md transition-all duration-300 hover:shadow-lg"
                  >
                    {loading ? (
                      "Entrando..."
                    ) : (
                      <>
                        Entrar no Sistema
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>Sistema seguro com autenticação corporativa</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
