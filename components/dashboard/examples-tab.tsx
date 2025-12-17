"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Code2 } from "lucide-react"
import { codeExamples, getAllLanguages, type CodeExample } from "@/lib/code-examples"

export function ExamplesTab() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")

  const languages = getAllLanguages()
  const filteredExamples =
    selectedLanguage === "all" ? codeExamples : codeExamples.filter((ex) => ex.language === selectedLanguage)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const categoryColors: Record<CodeExample["category"], string> = {
    validation: "bg-blue-500",
    mask: "bg-green-500",
    database: "bg-purple-500",
    form: "bg-orange-500",
    api: "bg-pink-500",
  }

  const categoryLabels: Record<CodeExample["category"], string> = {
    validation: "Validação",
    mask: "Máscara",
    database: "Banco de Dados",
    form: "Formulário",
    api: "API",
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <h1 className="text-3xl font-bold mb-4">Exemplos Práticos por Linguagem</h1>
        <p className="text-lg text-muted-foreground">
          Exemplos de código prontos para implementar suporte a CNPJ alfanumérico em diferentes linguagens e frameworks.
          Copie e adapte para seu projeto.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="font-semibold">Filtrar por linguagem:</span>
          <Button
            variant={selectedLanguage === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLanguage("all")}
          >
            Todas
          </Button>
          {languages.map((lang) => (
            <Button
              key={lang}
              variant={selectedLanguage === lang ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage(lang)}
            >
              {lang}
            </Button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredExamples.map((example, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{example.title}</h3>
                    <Badge variant="secondary">{example.language}</Badge>
                    <Badge className={categoryColors[example.category]}>{categoryLabels[example.category]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </div>
              </div>

              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="before"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                  >
                    Antes (Numérico)
                  </TabsTrigger>
                  <TabsTrigger
                    value="after"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
                  >
                    Depois (Alfanumérico)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="before">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.before}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(example.before, index * 2)}
                    >
                      {copiedIndex === index * 2 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="after">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.after}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(example.after, index * 2 + 1)}
                    >
                      {copiedIndex === index * 2 + 1 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>Explicação:</strong> {example.explanation}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredExamples.length === 0 && (
          <div className="text-center py-12">
            <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum exemplo encontrado para esta linguagem.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
