import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database } from "lucide-react"

interface DatabaseFinding {
  id: string
  database_type: string
  table_name: string
  column_name: string
  column_type: string
  column_length: number | null
  is_nullable: boolean
  suggestion: string
}

export function DatabaseFindings({ findings }: { findings: DatabaseFinding[] }) {
  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campos de Banco de Dados</CardTitle>
          <CardDescription>Colunas que precisam ser alteradas para suportar CNPJ alfanumérico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum campo de banco de dados encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campos de Banco de Dados</CardTitle>
        <CardDescription>
          {findings.length} coluna{findings.length !== 1 ? "s" : ""} que precisa{findings.length !== 1 ? "m" : ""} ser
          alterada{findings.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Tabela</TableHead>
              <TableHead>Coluna</TableHead>
              <TableHead>Tipo Atual</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Nullable</TableHead>
              <TableHead>Sugestão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map((finding) => (
              <TableRow key={finding.id}>
                <TableCell>
                  <Badge variant="outline">{finding.database_type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{finding.table_name}</TableCell>
                <TableCell className="font-mono text-sm">{finding.column_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{finding.column_type}</TableCell>
                <TableCell>{finding.column_length || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={finding.is_nullable ? "secondary" : "outline"}>
                    {finding.is_nullable ? "Sim" : "Não"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md text-xs">{finding.suggestion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
