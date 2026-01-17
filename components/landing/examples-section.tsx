"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Code2 } from "lucide-react"
import { codeExamples, getAllLanguages, type CodeExample } from "@/lib/code-examples"

export function ExamplesSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("JavaScript")

  const languages = getAllLanguages()
  const filteredExamples =
    selectedLanguage === "all" ? codeExamples : codeExamples.filter((ex) => ex.language === selectedLanguage)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const categoryColors: Record<CodeExample["category"], string> = {
    validation: "bg-[#0052CC]",
    mask: "bg-emerald-500",
    database: "bg-violet-500",
    form: "bg-[#FF8C00]",
    api: "bg-rose-500",
  }

  const categoryLabels: Record<CodeExample["category"], string> = {
    validation: "Validação",
    mask: "Máscara",
    database: "Banco de Dados",
    form: "Formulário",
    api: "API",
  }

  return (
    <section id="exemplos" className="py-16 bg-gradient-to-b from-[#FFD700]/60 via-[#FFD700]/30 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-gray-900">Código Pronto para Usar</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance">
            Exemplos em múltiplas linguagens para implementar suporte a CNPJ alfanumérico
          </p>
        </div>

        <Card className="p-8 max-w-6xl mx-auto bg-white shadow-2xl border-0">
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <span className="font-semibold text-lg text-gray-700">Filtrar por linguagem:</span>
            <Button
              variant={selectedLanguage === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage("all")}
              className={
                selectedLanguage === "all"
                  ? "bg-[#0052CC] hover:bg-[#0052CC]/90"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            >
              Todas
            </Button>
            {languages.map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
                className={
                  selectedLanguage === lang
                    ? "bg-[#0052CC] hover:bg-[#0052CC]/90"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }
              >
                {lang}
              </Button>
            ))}
          </div>

          <div className="space-y-8">
            {filteredExamples.map((example, index) => (
              <Card key={index} className="p-6 border border-gray-200 bg-gray-50/50">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">{example.title}</h3>
                      <Badge variant="secondary" className="font-mono bg-gray-200 text-gray-700">
                        {example.language}
                      </Badge>
                      <Badge className={`${categoryColors[example.category]} text-white`}>
                        {categoryLabels[example.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{example.description}</p>
                  </div>
                </div>

                <Tabs defaultValue="before" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
                    <TabsTrigger
                      value="before"
                      className="data-[state=active]:bg-[#0052CC] data-[state=active]:text-white"
                    >
                      Antes (Numérico)
                    </TabsTrigger>
                    <TabsTrigger
                      value="after"
                      className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white"
                    >
                      Depois (Alfanumérico)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="before">
                    <div className="relative">
                      <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto text-sm">
                        <code className="text-gray-100">{example.before}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white border-0"
                        onClick={() => copyToClipboard(example.before, index * 2)}
                      >
                        {copiedIndex === index * 2 ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-400" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="after">
                    <div className="relative">
                      <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto text-sm">
                        <code className="text-gray-100">{example.after}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white border-0"
                        onClick={() => copyToClipboard(example.after, index * 2 + 1)}
                      >
                        {copiedIndex === index * 2 + 1 ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-400" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 p-4 bg-[#0052CC]/5 rounded-lg border border-[#0052CC]/20">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Explicação:</strong> {example.explanation}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {filteredExamples.length === 0 && (
            <div className="text-center py-16">
              <Code2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-500">Nenhum exemplo encontrado para esta linguagem.</p>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
