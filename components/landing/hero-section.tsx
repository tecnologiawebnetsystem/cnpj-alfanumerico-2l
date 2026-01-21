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
  Download,
  Smartphone,
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

      <header className="relative z-50 pt-6">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden shadow-md border-2 border-[#0052CC]/30">
                <Image
                  src="/images/act-logo-horizontal.jpeg"
                  alt="ACT Digital"
                  width={100}
                  height={40}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block border-l-2 border-[#0052CC]/20 pl-3">
                <h1 className="text-lg font-bold text-gray-800">CNPJ Alfanumérico</h1>
                <p className="text-xs text-gray-500">Powered by AI</p>
              </div>
            </div>

            {/* Desktop Navigation - Floating Pill Style */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-2 py-1.5 border border-gray-200/60 shadow-lg shadow-gray-200/30">
                <button
                  onClick={() => scrollToSection("solucao")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all duration-200"
                >
                  <Zap className="h-4 w-4" />
                  Solucao
                </button>
                <button
                  onClick={() => scrollToSection("validador")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all duration-200"
                >
                  <CheckCircle className="h-4 w-4" />
                  Validador
                </button>
                <button
                  onClick={() => scrollToSection("exemplos")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all duration-200"
                >
                  <Code className="h-4 w-4" />
                  Exemplos
                </button>
                <Link
                  href="/wiki"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4" />
                  Wiki
                </Link>
                <Link
                  href="/download"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  App
                </Link>
              </div>

              {/* Login Button with Glow */}
              <button
                onClick={() => scrollToSection("login")}
                className="ml-4 group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0052CC] to-[#00A3E0] rounded-xl blur opacity-30 group-hover:opacity-50 transition-all duration-300" />
                <div className="relative flex items-center gap-2 bg-gradient-to-r from-[#0052CC] to-[#0052CC]/90 hover:from-[#0052CC]/90 hover:to-[#00A3E0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg">
                  <Lock className="h-4 w-4" />
                  Entrar
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200/60 text-gray-600 hover:text-[#0052CC] hover:bg-white transition-all shadow-md" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden absolute left-4 right-4 top-24 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => scrollToSection("solucao")}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-gray-700 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all"
              >
                <div className="p-2 rounded-lg bg-[#0052CC]/10">
                  <Zap className="h-4 w-4 text-[#0052CC]" />
                </div>
                <span className="font-medium">Solucao</span>
                <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
              </button>
              <button
                onClick={() => scrollToSection("validador")}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-gray-700 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all"
              >
                <div className="p-2 rounded-lg bg-[#27AE60]/10">
                  <CheckCircle className="h-4 w-4 text-[#27AE60]" />
                </div>
                <span className="font-medium">Validador</span>
                <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
              </button>
              <button
                onClick={() => scrollToSection("exemplos")}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-gray-700 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all"
              >
                <div className="p-2 rounded-lg bg-[#E67E22]/10">
                  <Code className="h-4 w-4 text-[#E67E22]" />
                </div>
                <span className="font-medium">Exemplos</span>
                <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
              </button>
              <Link
                href="/wiki"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-gray-700 hover:text-[#0052CC] hover:bg-[#0052CC]/5 transition-all"
              >
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                </div>
                <span className="font-medium">Wiki</span>
                <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
              <Link
                href="/download"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Smartphone className="h-4 w-4 text-green-500" />
                </div>
                <span className="font-medium">Baixar App</span>
                <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  onClick={() => scrollToSection("login")}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-gradient-to-r from-[#0052CC] to-[#00A3E0] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Lock className="h-4 w-4" />
                  Entrar na Plataforma
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
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
                <p className="text-sm font-medium text-gray-700">Analise IA</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-white shadow-sm border border-gray-100">
                <Award className="h-7 w-7 text-[#27AE60] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Certificado</p>
              </div>
            </div>

            {/* App Download Section */}
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Disponivel para todas as plataformas</h3>
                    <p className="text-sm text-gray-500">Instale o app e acesse de qualquer lugar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Android */}
                  <div className="group relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-green-400 group-hover:shadow-md transition-all cursor-pointer">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Android</span>
                  </div>
                  {/* iOS */}
                  <div className="group relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-gray-400 group-hover:shadow-md transition-all cursor-pointer">
                      <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">iOS</span>
                  </div>
                  {/* Windows */}
                  <div className="group relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-400 group-hover:shadow-md transition-all cursor-pointer">
                      <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                      </svg>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Windows</span>
                  </div>
                  {/* macOS */}
                  <div className="group relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-gray-400 group-hover:shadow-md transition-all cursor-pointer">
                      <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">macOS</span>
                  </div>
                  {/* Linux */}
                  <div className="group relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-orange-400 group-hover:shadow-md transition-all cursor-pointer">
                      <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.002c-.06.135-.12.2-.223.334h-.003c-.067.063-.197.135-.397.2.088.134.133.2.166.269.033.066.053.066.097.133h.006c.025.135.073.2.12.27.044.066.108.135.167.135v.003c.088.069.174.134.223.2.055.066.096.135.122.2-.032.067-.06.2-.12.267-.065.067-.154.135-.266.135h-.049c-.108-.003-.2-.038-.297-.07h-.002a5.918 5.918 0 00-.494-.134c-.18-.044-.368-.07-.567-.135-.388-.131-.789-.27-1.22-.534-.443-.27-.768-.669-1.327-.936-.559-.268-1.337-.47-2.11-.602-.775-.135-1.495-.203-2.109-.27v.015c-.01.039-.022.077-.033.115-.095.267-.24.532-.482.666-.242.135-.535.135-.765.135-.23 0-.396-.006-.495-.002h-.007a.78.78 0 00-.267.065c-.09.039-.188.135-.327.2v.001c-.14.065-.326.135-.56.135-.23 0-.454-.065-.65-.135-.2-.07-.336-.135-.49-.2-.152-.067-.27-.069-.37-.135-.1-.066-.178-.135-.242-.2-.065-.07-.096-.135-.109-.2a.403.403 0 01-.014-.068l-.003-.015c-.034-.2.054-.267.166-.334.115-.066.262-.066.407-.002.143.068.293.135.495.268.203.135.452.269.726.403.273.135.56.2.865.2.305 0 .607-.065.887-.135.28-.07.538-.2.766-.4v.003c.042-.027.084-.05.126-.073.21-.135.449-.27.727-.47.279-.2.514-.335.724-.401.21-.066.378-.066.528-.066h.007c.033 0 .067.003.102.007l-.004.001c.22.016.422.134.641.266.132.082.26.177.391.266h.002c.263.182.44.267.656.267.219 0 .438-.067.685-.133.248-.067.487-.2.696-.333.21-.135.39-.27.519-.47.131-.2.213-.401.232-.667a4.69 4.69 0 01-.029-1.004c.02-.5.07-1.003.15-1.503.04-.2.078-.399.122-.597.044-.2.089-.4.136-.6-.047-.067-.092-.2-.13-.268-.035-.066-.066-.135-.093-.2-.066-.133-.117-.266-.15-.4a5.96 5.96 0 01-.1-.465c-.027-.2-.045-.332-.045-.533v-.2c0-.2.016-.267.042-.533.026-.2.066-.4.122-.6.044-.201.096-.334.152-.534.054-.135.109-.27.168-.4.06-.135.12-.27.182-.4.06-.2.12-.267.182-.4.06-.135.12-.2.18-.266.06-.07.115-.135.166-.2l-.001-.001c-.009-.034-.024-.068-.04-.102-.086-.21-.18-.42-.272-.632a9.228 9.228 0 01-.248-.667c-.064-.2-.106-.401-.132-.6v-.003c-.027-.2-.04-.4-.04-.6v-.202c0-.135.007-.266.015-.4 0-.065.003-.135.007-.2h.001c.02-.135.043-.27.07-.402z"/>
                      </svg>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Linux</span>
                  </div>
                </div>
                <Link href="/download" className="ml-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium shadow-md shadow-green-500/20 hover:shadow-lg transition-all flex items-center gap-2">
                    Baixar App
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
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
