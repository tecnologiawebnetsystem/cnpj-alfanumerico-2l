"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function DemoSection() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const personalDomains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "live.com"]
    const domain = email.split("@")[1]?.toLowerCase()

    if (!emailRegex.test(email)) {
      return "E-mail inválido"
    }

    if (personalDomains.includes(domain)) {
      return "Por favor, utilize um e-mail corporativo"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(formData.email)
    if (emailError) {
      toast.error(emailError)
      return
    }

    if (!formData.name || !formData.phone) {
      toast.error("Por favor, preencha todos os campos")
      return
    }

    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    setSubmitted(true)
    toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.")
  }

  if (submitted) {
    return (
      <section id="demonstracao" className="py-24 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/50">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Solicitação Recebida!</h3>
                <p className="text-muted-foreground mb-6">
                  Obrigado pelo interesse, {formData.name}. Nossa equipe entrará em contato em breve através do e-mail{" "}
                  {formData.email} para agendar sua demonstração personalizada.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Enviar Nova Solicitação
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="demonstracao" className="py-24 border-b border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Solicite uma <span className="text-primary">Demonstração</span>
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Veja na prática como nossa solução pode preparar seus sistemas para o CNPJ alfanumérico. Preencha o
              formulário e nossa equipe entrará em contato.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agende sua demonstração gratuita</CardTitle>
              <CardDescription>
                Preencha seus dados corporativos para receber acesso à demonstração completa da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao.silva@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Utilize um e-mail profissional (não aceitamos e-mails pessoais como Gmail, Hotmail, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Solicitar Demonstração Gratuita"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao enviar este formulário, você concorda em receber comunicações da WebNetSystems sobre nossos
                  produtos e serviços.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
