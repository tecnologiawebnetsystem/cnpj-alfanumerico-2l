"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AwsInfraSection } from "./aws-infra-section"
import { AzureInfraSection } from "./azure-infra-section"
import { SqlServerSection } from "./sql-server-section"
import { ArchitectureOverview } from "./architecture-overview"
import { NetworkDiagram } from "./network-diagram"
import { CostEstimate } from "./cost-estimate"
import {
  Cloud,
  Server,
  Database,
  LayoutDashboard,
  Network,
  DollarSign,
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function InfraDocumentation() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Documentacao de Infraestrutura
              </h1>
              <p className="text-sm text-muted-foreground">
                CNPJ Detector - Guia de Implantacao AWS, Azure e SQL Server
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = document.getElementById("infra-content")
                if (el) {
                  const blob = new Blob([el.innerText], { type: "text/plain" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "cnpj-detector-infra-docs.txt"
                  a.click()
                  URL.revokeObjectURL(url)
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="infra-content" className="mx-auto max-w-7xl px-4 py-8">
        {/* Version Info */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Versao 2.0
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Fevereiro 2026
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Next.js 16 + React 19
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            SQL Server + Supabase
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-lg">
            <TabsTrigger value="overview" className="gap-2 text-sm">
              <LayoutDashboard className="h-4 w-4" />
              Visao Geral
            </TabsTrigger>
            <TabsTrigger value="aws" className="gap-2 text-sm">
              <Cloud className="h-4 w-4" />
              AWS
            </TabsTrigger>
            <TabsTrigger value="azure" className="gap-2 text-sm">
              <Server className="h-4 w-4" />
              Azure
            </TabsTrigger>
            <TabsTrigger value="sqlserver" className="gap-2 text-sm">
              <Database className="h-4 w-4" />
              SQL Server
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2 text-sm">
              <Network className="h-4 w-4" />
              Rede e Seguranca
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Custos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ArchitectureOverview />
          </TabsContent>
          <TabsContent value="aws">
            <AwsInfraSection />
          </TabsContent>
          <TabsContent value="azure">
            <AzureInfraSection />
          </TabsContent>
          <TabsContent value="sqlserver">
            <SqlServerSection />
          </TabsContent>
          <TabsContent value="network">
            <NetworkDiagram />
          </TabsContent>
          <TabsContent value="costs">
            <CostEstimate />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
