import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileCode, Eye, Keyboard, Shield, Users } from "lucide-react"

interface Finding {
  id: string
  file_path: string
  line_number: number
  field_name: string
  field_type: string
  context: string
  suggestion: string
  is_input: boolean
  is_output: boolean
  is_validation: boolean
  supports_cpf: boolean
}

export function CodeFindings({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ocorrências no Código</CardTitle>
          <CardDescription>Campos CNPJ encontrados nos arquivos do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">Nenhuma ocorrência de CNPJ encontrada no código</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocorrências no Código</CardTitle>
        <CardDescription>
          {findings.length} campo{findings.length !== 1 ? "s" : ""} CNPJ encontrado{findings.length !== 1 ? "s" : ""}{" "}
          nos arquivos do projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arquivo</TableHead>
              <TableHead>Linha</TableHead>
              <TableHead>Campo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contexto</TableHead>
              <TableHead>Sugestão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map((finding) => (
              <TableRow key={finding.id}>
                <TableCell className="font-mono text-xs">{finding.file_path}</TableCell>
                <TableCell>{finding.line_number}</TableCell>
                <TableCell className="font-medium">{finding.field_name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {finding.is_input && (
                      <Badge variant="secondary" className="text-xs">
                        <Keyboard className="mr-1 h-3 w-3" />
                        Input
                      </Badge>
                    )}
                    {finding.is_output && (
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Output
                      </Badge>
                    )}
                    {finding.is_validation && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Validação
                      </Badge>
                    )}
                    {finding.supports_cpf && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        CPF/CNPJ
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{finding.context}</TableCell>
                <TableCell className="max-w-md text-xs">{finding.suggestion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
