"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Calendar } from "lucide-react"
import { checkLicense, type LicenseStatus } from "@/lib/license-checker"
import { Button } from "@/components/ui/button"

export function LicenseWarning() {
  const [license, setLicense] = useState<LicenseStatus | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadLicense = async () => {
      try {
        console.log("[v0] LicenseWarning - checking license status")
        const status = await checkLicense()
        console.log("[v0] LicenseWarning - license status:", status)
        setLicense(status)
      } catch (err) {
        console.error("[v0] LicenseWarning - error checking license:", err)
        setError(true)
        // Don't block the dashboard if license check fails
      }
    }
    loadLicense()
  }, [])

  if (error || !license) {
    return null
  }

  if (license.isExpired) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Licença Expirada</AlertTitle>
        <AlertDescription>
          <p className="mb-3">Sua licença expirou. Entre em contato com o administrador para renovar o acesso.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href="mailto:contato@webnetsystems.com.br">Renovar Licença</a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!license.daysRemaining) {
    return null
  }

  // Mostrar aviso se faltam menos de 30 dias
  if (license.daysRemaining > 30) {
    return null
  }

  return (
    <Alert variant={license.daysRemaining <= 7 ? "destructive" : "default"} className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Atenção: Licença expirando em breve
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Sua licença expira em <strong>{license.daysRemaining} dias</strong>(
          {license.licenseEnd ? new Date(license.licenseEnd).toLocaleDateString("pt-BR") : ""}). Entre em contato para
          renovar e evitar interrupção do serviço.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href="mailto:contato@webnetsystems.com.br">Renovar Licença</a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
