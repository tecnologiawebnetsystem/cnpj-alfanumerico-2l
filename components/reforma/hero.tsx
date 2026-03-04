import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export function ReformaHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/3 to-transparent" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="gap-2 bg-primary/10 border-primary/20 text-primary font-medium mb-8">
            <Clock className="h-3 w-3" />
            Transicao iniciando em 2026
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
            Reforma Tributaria 2026:{" "}
            <span className="text-primary">o que sao IBS e CBS</span> e tudo que voce precisa saber
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed mb-10">
            A reforma tributaria esta chegando e a{" "}
            <span className="font-semibold text-foreground">WebNetSystem</span> ajuda voce a passar por ela com
            seguranca. Entenda os novos impostos, o periodo de transicao e como preparar sua empresa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/solucoes/cnpj-detector">
              <Button size="lg" className="gap-2 text-base font-semibold px-8 h-13 bg-primary text-primary-foreground hover:bg-primary/90">
                Conheca nossas solucoes
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-13 border-border text-foreground hover:bg-muted" asChild>
              <a href="#o-que-muda">Leia o artigo completo</a>
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">IVA Dual</p>
                <p className="text-sm text-muted-foreground">IBS + CBS unificados</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">2026-2033</p>
                <p className="text-sm text-muted-foreground">Periodo de transicao</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">5 impostos</p>
                <p className="text-sm text-muted-foreground">Substituidos por 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
