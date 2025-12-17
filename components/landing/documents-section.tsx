import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink } from "lucide-react"

export function DocumentsSection() {
  const documents = [
    {
      title: "Apresentação do CNPJ Alfanumérico",
      description: "Documento oficial da Receita Federal.",
      url: "https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/apresentacoes/outros-eventos/cnpj-alfanumerico.pdf",
    },
    {
      title: "Perguntas e Respostas - CNPJ Alfanumérico",
      description:
        "Documento oficial da Receita Federal com perguntas frequentes sobre a implementação do novo formato de CNPJ.",
      url: "https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf",
    },
    {
      title: "Cálculo do Dígito Verificador",
      description: "Documento oficial da Receita Federal explicando como calcular o dígito verificador do novo CNPJ.",
      url: "https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf",
    },
    {
      title: "Instrução Normativa RFB nº 2.229/2024",
      description: "Documento oficial da Receita Federal com a instrução normativa.",
      url: "https://normasinternet2.receita.fazenda.gov.br/#/consulta/externa/141102",
    },
  ]

  return (
    <section className="py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Conheça o Projeto</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Acesse documentos oficiais e informações detalhadas sobre o CNPJ Alfanumérico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {documents.map((doc, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{doc.description}</p>
                    <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        Ver Documento
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
