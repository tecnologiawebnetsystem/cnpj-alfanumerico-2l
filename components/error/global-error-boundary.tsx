"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { logError } from "@/lib/error-logger"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  async componentDidCatch(error: Error, errorInfo: any) {
    console.error(" GlobalErrorBoundary caught error:", error, errorInfo)

    try {
      await logError({
        error_type: "rendering",
        error_message: error.message,
        error_stack: error.stack || "",
        component_name: errorInfo.componentStack?.split("\n")[1]?.trim() || "Unknown",
        page_url: typeof window !== "undefined" ? window.location.href : "",
        metadata: {
          componentStack: errorInfo.componentStack,
          errorInfo: errorInfo,
        },
        severity: "high",
      })
    } catch (logError) {
      console.error(" Failed to log error:", logError)
    }

    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="max-w-2xl w-full p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Error Icon */}
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>

              {/* Error Message */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h1>
                <p className="text-lg text-gray-600 mb-4">
                  Encontramos um problema inesperado, mas já estamos cuidando disso!
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 font-medium">✓ O erro foi registrado automaticamente</p>
                  <p className="text-sm text-red-700 mt-1">
                    ✓ Nossa equipe técnica foi notificada e entrará em contato
                  </p>
                </div>
              </div>

              {/* Technical Details (collapsed by default) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="w-full">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Detalhes técnicos (apenas em desenvolvimento)
                  </summary>
                  <pre className="mt-2 text-left text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-4 flex-wrap justify-center">
                <Button onClick={() => window.location.reload()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="gap-2">
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
              </div>

              {/* Support Info */}
              <div className="text-sm text-gray-500 border-t pt-4 w-full">
                <p>
                  Se o problema persistir, entre em contato com nosso suporte:
                  <br />
                  <a href="mailto:suporte@aegis.com" className="text-primary hover:underline font-medium">
                    suporte@aegis.com
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
