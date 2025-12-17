"use client"

import { Calendar } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Prazo: Julho 2026</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6 text-balance">
            Não deixe para a última hora
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            A mudança para o CNPJ alfanumérico é obrigatória e afetará todos os sistemas que trabalham com cadastros
            empresariais. Comece sua migração agora e evite problemas operacionais e multas.
          </p>
        </div>
      </div>
    </section>
  )
}
