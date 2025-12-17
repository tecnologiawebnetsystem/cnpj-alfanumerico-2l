"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    console.error("[v0] ErrorBoundary caught error:", error)
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[v0] ErrorBoundary details:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="p-8 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Algo deu errado</h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                Ocorreu um erro ao carregar esta seção. Tente recarregar a página.
              </p>
              {this.state.error && (
                <details className="text-left text-sm text-red-600 dark:text-red-400 mb-4">
                  <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
                  <pre className="mt-2 p-4 bg-red-100 dark:bg-red-900/20 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <Button onClick={this.handleReset} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
