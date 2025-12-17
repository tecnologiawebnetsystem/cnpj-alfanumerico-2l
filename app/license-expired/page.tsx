"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Mail, Phone } from "lucide-react"
import { LogoIcon } from "@/components/landing/logo"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"

export default function LicenseExpiredPage() {
  const [licenseInfo, setLicenseInfo] = useState<{
    clientName: string
    licenseEnd: string
  } | null>(null)

  useEffect(() => {
    const loadLicenseInfo = async () => {
      const user = getCurrentUser()
      if (user?.client_id) {
        try {
          const response = await fetch(`/api/clients/${user.client_id}`)
          if (response.ok) {
            const client = await response.json()
            setLicenseInfo({
              clientName: client.name,
              licenseEnd: new Date(client.license_end).toLocaleDateString("pt-BR"),
            })
          }
        } catch (error) {
          console.error("Erro ao carregar informações da licença:", error)
        }
      }
    }
    loadLicenseInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <LogoIcon className="h-12 w-12" />
            <div className="text-left">
              <h1 className="text-xl font-bold leading-none">CNPJ Alfanumérico</h1>
              <p className="text-sm text-muted-foreground">Análise e Migração</p>
            </div>
          </Link>
        </div>

        <Card className="border-red-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Licença Expirada</CardTitle>
            <CardDescription className="text-base">
              Sua licença de uso do sistema expirou e precisa ser renovada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {licenseInfo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Data de Expiração:</span>
                  <span className="text-red-900">{licenseInfo.licenseEnd}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Cliente:</span>
                  <span className="text-red-900">{licenseInfo.clientName}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Para renovar sua licença:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Entre em contato com nossa equipe comercial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Escolha o plano ideal para sua empresa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Após a renovação, seu acesso será reativado imediatamente</span>
                </li>
              </ul>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <Button className="w-full" size="lg" asChild>
                <a href="mailto:contato@cnpjalfanumerico.com.br">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar E-mail
                </a>
              </Button>
              <Button className="w-full bg-transparent" size="lg" variant="outline" asChild>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Dúvidas sobre renovação?</p>
              <p className="text-xs text-muted-foreground">
                Telefone: (11) 9999-9999 | E-mail: contato@cnpjalfanumerico.com.br
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" asChild>
            <Link href="/login">Voltar para o Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
