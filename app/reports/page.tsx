"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, TrendingUp } from "lucide-react"

export default function DeveloperReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios gerenciais para coordenadores e gestores</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório de Produtividade
            </CardTitle>
            <CardDescription>Resumo das tarefas concluídas e tempo gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatório Semanal
            </CardTitle>
            <CardDescription>Atividades e entregas da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Relatório de Progresso
            </CardTitle>
            <CardDescription>Evolução mensal de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
