"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export function AdminRepositoriesTab() {
  const [repositories, setRepositories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      const user = getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/admin/repositories?user_id=${user.id}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      }
    } catch (error) {
      console.error("Erro ao carregar repositórios:", error)
    }
  }

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.client_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Repositórios</h2>
            <p className="text-green-100">Gerencie todos os repositórios dos clientes</p>
          </div>
          <div className="relative flex-1 max-w-sm ml-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-200" />
            <Input
              placeholder="Buscar repositórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-green-200"
            />
          </div>
        </div>
      </div>

      <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead className="text-slate-900">Repositório</TableHead>
              <TableHead className="text-slate-900">Cliente</TableHead>
              <TableHead className="text-slate-900">Linguagem</TableHead>
              <TableHead className="text-slate-900">Última Análise</TableHead>
              <TableHead className="text-slate-900">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRepositories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-600">
                  Nenhum repositório encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredRepositories.map((repo) => (
                <TableRow key={repo.id} className="border-slate-200">
                  <TableCell className="font-medium text-slate-900">{repo.name}</TableCell>
                  <TableCell className="text-slate-700">{repo.client_name}</TableCell>
                  <TableCell className="text-slate-700">{repo.language || "-"}</TableCell>
                  <TableCell className="text-slate-700">
                    {repo.last_analyzed_at ? new Date(repo.last_analyzed_at).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={repo.is_private ? "secondary" : "outline"}
                      className="bg-green-100 text-green-700 border-green-300"
                    >
                      {repo.is_private ? "Privado" : "Público"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
