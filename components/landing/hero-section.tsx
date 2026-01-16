"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Lock, Mail, ArrowRight, Shield, Zap, Award } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function HeroSection() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
      } else {
        const error = await res.json()
        toast.error(error.message || "Credenciais inválidas")
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0052CC] via-[#FF8C00] to-[#FFD700] animate-gradient opacity-90" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#0052CC]/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="container relative mx-auto px-4 py-12 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
          <div className="text-white space-y-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <Image
                  src="/images/act-logo-horizontal.jpeg"
                  alt="ACT Digital"
                  width={180}
                  height={80}
                  className="rounded-lg"
                />
              </div>
              <div className="text-4xl font-bold text-[#FFD700]">×</div>
              <div className="bg-gradient-to-br from-[#FF8C00] to-[#FFD700] p-6 rounded-2xl shadow-2xl">
                <div className="text-3xl font-black text-white">BS2</div>
              </div>
            </div>

            <Badge variant="secondary" className="mb-4 gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white">
              <AlertCircle className="h-3 w-3" />
              Obrigatório a partir de Julho/2026
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-balance leading-tight">
              CNPJ <span className="text-[#FFD700]">Alfanumérico</span>
              <br />
              <span className="text-3xl md:text-4xl font-semibold text-white/90">Powered by AI</span>
            </h1>

            <p className="text-xl text-white/90 text-balance leading-relaxed max-w-xl">
              Solução completa de <span className="font-bold text-[#FFD700]">Inteligência Artificial</span> para adaptar
              sua empresa ao novo formato de CNPJ.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="h-8 w-8 text-[#FFD700] mx-auto mb-2" />
                <p className="text-sm font-semibold">100% Seguro</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Zap className="h-8 w-8 text-[#FFD700] mx-auto mb-2" />
                <p className="text-sm font-semibold">Análise IA</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Award className="h-8 w-8 text-[#FFD700] mx-auto mb-2" />
                <p className="text-sm font-semibold">Certificado</p>
              </div>
            </div>
          </div>

          <Card className="p-8 md:p-10 shadow-2xl border-white/20 backdrop-blur-xl bg-white/95">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0052CC] to-[#FF8C00] mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Acesse sua Conta</h2>
                <p className="text-muted-foreground">Entre com suas credenciais corporativas</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
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
                    className="h-12 border-gray-300 focus:border-[#0052CC] focus:ring-[#0052CC]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
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
                    className="h-12 border-gray-300 focus:border-[#0052CC] focus:ring-[#0052CC]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0052CC] to-[#FF8C00] hover:from-[#0052CC]/90 hover:to-[#FF8C00]/90 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
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

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Sistema seguro com autenticação corporativa</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
