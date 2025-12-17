import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { GlobalErrorBoundary } from "@/components/error/global-error-boundary"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CNPJ Alfanumérico - Solução Completa para Migração",
  description:
    "Prepare seus sistemas para o novo formato de CNPJ alfanumérico que entra em vigor em julho de 2026. Análise automatizada, relatórios detalhados e suporte especializado.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <GlobalErrorBoundary>
          {children}
          <Toaster />
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
