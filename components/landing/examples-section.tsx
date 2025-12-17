"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Code2, BookOpen } from "lucide-react"
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
    validation: "bg-sky-400/80",
    mask: "bg-emerald-400/80",
    database: "bg-violet-400/80",
    form: "bg-amber-400/80",
    api: "bg-rose-400/80",
  }

  const categoryLabels: Record<CodeExample["category"], string> = {
    validation: "Validação",
    mask: "Máscara",
    database: "Banco de Dados",
    form: "Formulário",
    api: "API",
  }

  return (
    <section id="exemplos" className="py-8 bg-gradient-to-b from-slate-50 via-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 mb-6 border border-slate-200">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-semibold">Exemplos Práticos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-slate-900">Código Pronto para Usar</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto text-balance">
            Exemplos em múltiplas linguagens para implementar suporte a CNPJ alfanumérico
          </p>
        </div>

        <Card className="p-8 max-w-6xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <span className="font-semibold text-lg text-slate-700">Filtrar por linguagem:</span>
            <Button
              variant={selectedLanguage === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage("all")}
              className={
                selectedLanguage === "all"
                  ? "bg-slate-700 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
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
                    ? "bg-slate-700 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }
              >
                {lang}
              </Button>
            ))}
          </div>

          <div className="space-y-8">
            {filteredExamples.map((example, index) => (
              <Card key={index} className="p-6 border-2 border-slate-200 bg-slate-50/30">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900">{example.title}</h3>
                      <Badge variant="secondary" className="font-mono bg-slate-200 text-slate-700 border-slate-300">
                        {example.language}
                      </Badge>
                      <Badge className={categoryColors[example.category]}>{categoryLabels[example.category]}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{example.description}</p>
                  </div>
                </div>

                <Tabs defaultValue="before" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100">
                    <TabsTrigger
                      value="before"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-200 transition-all"
                    >
                      Antes (Numérico)
                    </TabsTrigger>
                    <TabsTrigger
                      value="after"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-200 transition-all"
                    >
                      Depois (Alfanumérico)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="before">
                    <div className="relative">
                      <pre className="bg-slate-100 p-6 rounded-lg overflow-x-auto text-sm border border-slate-200">
                        <code className="text-slate-800">{example.before}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 bg-white hover:bg-slate-50 border border-slate-200"
                        onClick={() => copyToClipboard(example.before, index * 2)}
                      >
                        {copiedIndex === index * 2 ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-emerald-600" />
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
                      <pre className="bg-slate-100 p-6 rounded-lg overflow-x-auto text-sm border border-slate-200">
                        <code className="text-slate-800">{example.after}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 bg-white hover:bg-slate-50 border border-slate-200"
                        onClick={() => copyToClipboard(example.after, index * 2 + 1)}
                      >
                        {copiedIndex === index * 2 + 1 ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-emerald-600" />
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

                <div className="mt-4 p-4 bg-slate-100/70 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Explicação:</strong> {example.explanation}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {filteredExamples.length === 0 && (
            <div className="text-center py-16">
              <Code2 className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <p className="text-lg text-slate-500">Nenhum exemplo encontrado para esta linguagem.</p>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
