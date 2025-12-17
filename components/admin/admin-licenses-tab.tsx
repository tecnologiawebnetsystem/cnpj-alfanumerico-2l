"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Key } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminLicensesTab() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const response = await fetch("/api/admin/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const handleUpdateLicense = async (clientId: string, licenseData: any) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/license`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(licenseData),
      })
      if (response.ok) {
        loadClients()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Erro ao atualizar licença:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-500 to-pink-600 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Key className="h-6 w-6" />
            Gerenciamento de Licenças
          </CardTitle>
          <CardDescription className="text-orange-100">
            Controle as licenças de acesso dos clientes ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white/95 backdrop-blur rounded-lg p-6 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-800/50">
                <TableHead className="text-purple-200">Cliente</TableHead>
                <TableHead className="text-purple-200">Tipo</TableHead>
                <TableHead className="text-purple-200">Início</TableHead>
                <TableHead className="text-purple-200">Término</TableHead>
                <TableHead className="text-purple-200">Status</TableHead>
                <TableHead className="text-purple-200">Dias Restantes</TableHead>
                <TableHead className="text-purple-200">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const daysRemaining = client.license_end
                  ? Math.ceil((new Date(client.license_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <TableRow key={client.id} className="border-purple-800/50">
                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                    <TableCell className="text-purple-200">{client.license_type || "monthly"}</TableCell>
                    <TableCell className="text-purple-200">
                      {client.license_start ? new Date(client.license_start).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell className="text-purple-200">
                      {client.license_end ? new Date(client.license_end).toLocaleDateString("pt-BR") : "Sem expiração"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.license_active ? "default" : "destructive"}>
                        {client.license_active ? "Ativa" : "Expirada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {daysRemaining !== null ? (
                        <span className={`text-sm ${daysRemaining < 30 ? "text-red-400" : "text-purple-200"}`}>
                          {daysRemaining > 0 ? `${daysRemaining} dias` : "Expirada"}
                        </span>
                      ) : (
                        <span className="text-sm text-purple-200">∞</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-600 text-purple-300 hover:bg-purple-900/50 bg-transparent"
                          >
                            Gerenciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-purple-800/50">
                          <DialogHeader>
                            <DialogTitle className="text-white">Gerenciar Licença</DialogTitle>
                            <DialogDescription className="text-purple-300">{client.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-purple-200">Tipo de Licença</Label>
                              <Select defaultValue={client.license_type || "monthly"}>
                                <SelectTrigger className="bg-slate-900 border-purple-800/50 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Mensal</SelectItem>
                                  <SelectItem value="quarterly">Trimestral</SelectItem>
                                  <SelectItem value="annual">Anual</SelectItem>
                                  <SelectItem value="perpetual">Perpétua</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-200">Data de Início</Label>
                              <Input
                                type="date"
                                defaultValue={client.license_start}
                                className="bg-slate-900 border-purple-800/50 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-200">Data de Término</Label>
                              <Input
                                type="date"
                                defaultValue={client.license_end}
                                className="bg-slate-900 border-purple-800/50 text-white"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Salvar</Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleUpdateLicense(client.id, { license_active: false })}
                              >
                                Desativar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
