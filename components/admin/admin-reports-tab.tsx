"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from 'lucide-react'
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileSpreadsheet, File } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"

interface Client {
  id: string
  name: string
  cnpj: string
}

interface User {
  id: string
  name: string
  email: string
  client_id: string
}

export function AdminReportsTab() {
  const [loading, setLoading] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedClientClientes, setSelectedClientClientes] = useState<string>("all")
  const [selectedClientLicencas, setSelectedClientLicencas] = useState<string>("all")
  const [selectedClientAnalises, setSelectedClientAnalises] = useState<string>("all")
  const [selectedDevAnalises, setSelectedDevAnalises] = useState<string>("all")
  const [selectedClientFinanceiro, setSelectedClientFinanceiro] = useState<string>("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser?.id) {
          console.error(" No user found in reports tab")
          return
        }

        const [clientsRes, usersRes] = await Promise.all([
          fetch(`/api/admin/clients?user_id=${currentUser.id}`),
          fetch(`/api/admin/users?user_id=${currentUser.id}`),
        ])

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData)
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.filter((u: User) => u.client_id))
        }
      } catch (error) {
        console.error(" Error loading data:", error)
      }
    }

    loadData()
  }, [])

  const generateReport = async (type: string, format: "pdf" | "excel", clientId?: string, devId?: string) => {
    setLoading(`${type}-${format}`)
    console.log(` Generating ${type} report in ${format} format, client: ${clientId}, dev: ${devId}`)

    try {
      let url = `/api/admin/reports/generate?type=${type}&format=${format}`
      if (clientId && clientId !== "all") {
        url += `&clientId=${clientId}`
      }
      if (devId && devId !== "all") {
        url += `&devId=${devId}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `relatorio-${type}-${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "csv"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      console.log(` Report downloaded successfully`)
    } catch (error) {
      console.error(" Error generating report:", error)
      alert("Erro ao gerar relatório. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-purple-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Relatórios do Sistema</CardTitle>
          <CardDescription className="text-slate-600">Gere relatórios personalizados em PDF ou Excel</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório de Clientes
            </CardTitle>
            <CardDescription className="text-blue-700">Relatório consolidado de todos os clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm mb-2 block font-medium">Filtrar por Cliente:</label>
              <Select value={selectedClientClientes} onValueChange={setSelectedClientClientes}>
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  disabled={loading?.startsWith("clientes")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {loading?.startsWith("clientes") ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => generateReport("clientes", "pdf", selectedClientClientes)}>
                  <File className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generateReport("clientes", "excel", selectedClientClientes)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription className="text-green-700">Receitas e faturamento por cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm mb-2 block font-medium">Filtrar por Cliente:</label>
              <Select value={selectedClientFinanceiro} onValueChange={setSelectedClientFinanceiro}>
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  disabled={loading?.startsWith("financeiro")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {loading?.startsWith("financeiro") ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => generateReport("financeiro", "pdf", selectedClientFinanceiro)}>
                  <File className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generateReport("financeiro", "excel", selectedClientFinanceiro)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório de Análises
            </CardTitle>
            <CardDescription className="text-purple-700">Todas as análises realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm mb-2 block font-medium">Filtrar por Cliente:</label>
              <Select value={selectedClientAnalises} onValueChange={setSelectedClientAnalises}>
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-slate-700 text-sm mb-2 block font-medium">Filtrar por Dev:</label>
              <Select value={selectedDevAnalises} onValueChange={setSelectedDevAnalises}>
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Selecione um dev" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Devs</SelectItem>
                  {users
                    .filter((u) => selectedClientAnalises === "all" || u.client_id === selectedClientAnalises)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  disabled={loading?.startsWith("analises")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {loading?.startsWith("analises") ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => generateReport("analises", "pdf", selectedClientAnalises, selectedDevAnalises)}
                >
                  <File className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => generateReport("analises", "excel", selectedClientAnalises, selectedDevAnalises)}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription className="text-green-700">Receitas e faturamento por cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm mb-2 block font-medium">Filtrar por Cliente:</label>
              <Select value={selectedClientFinanceiro} onValueChange={setSelectedClientFinanceiro}>
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  disabled={loading?.startsWith("financeiro")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {loading?.startsWith("financeiro") ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => generateReport("financeiro", "pdf", selectedClientFinanceiro)}>
                  <File className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generateReport("financeiro", "excel", selectedClientFinanceiro)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
