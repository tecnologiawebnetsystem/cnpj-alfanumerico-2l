import { FileText, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DVCalculationSection() {
  const documents = [
    {
      title: "Manual de Cálculo do DV do CNPJ",
      type: "PDF",
      date: "05/11/2024 09h05",
      url: "https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf/view",
      icon: FileText,
    },
    {
      title: "Arquivos de Referência para Cálculo do DV",
      type: "ZIP",
      date: "05/11/2024 09h05",
      url: "https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/codigos-cnpj.zip/view",
      icon: Download,
    },
  ]

  return (
    <section id="calculo-dv" className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Cálculo do DV do CNPJ Alfanumérico</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Documentação técnica para realização do cálculo do dígito verificador de inscrição no Cadastro Nacional de
              Pessoas Jurídicas (CNPJ) Alfanumérico.
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-4 px-6 font-semibold text-sm">Título</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Tipo</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Data de modificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, index) => {
                      const Icon = doc.icon
                      return (
                        <tr key={index} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors group"
                            >
                              <Icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">{doc.title}</span>
                            </a>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {doc.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">{doc.date}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Documentos oficiais da Receita Federal do Brasil</p>
          </div>
        </div>
      </div>
    </section>
  )
}
