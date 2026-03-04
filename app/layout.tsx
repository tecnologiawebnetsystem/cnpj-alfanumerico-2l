import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { GlobalErrorBoundary } from "@/components/error/global-error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: "#CC1F1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "WebNetSystem - Reforma Tributaria 2026 | Solucoes para sua Empresa",
  description:
    "A reforma tributaria esta chegando e a WebNetSystem ajuda voce a passar por ela com seguranca. Entenda IBS, CBS, o periodo de transicao e como preparar sua empresa.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CNPJ App",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
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
          <ServiceWorkerRegister />
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
