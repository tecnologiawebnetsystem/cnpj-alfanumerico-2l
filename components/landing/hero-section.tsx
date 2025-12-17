"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, Sparkles } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="container relative mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-8 animate-fade-in">
            <Image
              src="/images/act-logo-horizontal.jpeg"
              alt="ACT Digital"
              width={240}
              height={100}
              className="rounded-xl shadow-2xl"
            />
          </div>

          <Badge variant="destructive" className="mb-6 gap-2 animate-pulse shadow-lg">
            <AlertCircle className="h-3 w-3" />
            Obrigatório a partir de Julho/2026
          </Badge>

          <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-8xl mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-fade-in-up">
            Prepare-se para o <span className="block mt-2">CNPJ Alfanumérico</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-10 max-w-2xl mx-auto md:text-2xl leading-relaxed">
            A partir de 2026, o novo formato de CNPJ será obrigatório no Brasil.{" "}
            <span className="font-bold text-primary">A ACT Digital</span>, empresa com mais de 5.600 colaboradores
            espalhados pelo mundo, traz a solução completa usando{" "}
            <span className="font-bold text-primary">Inteligência Artificial</span> para sua empresa se adaptar a essa
            mudança.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform">
              <p className="text-5xl font-bold text-primary mb-3">100%</p>
              <p className="text-sm text-muted-foreground font-medium">Conformidade com a Receita Federal</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform">
              <div className="flex justify-center mb-3">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Análise Completa de Código e Banco</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform">
              <p className="text-5xl font-bold text-primary mb-3">IA</p>
              <p className="text-sm text-muted-foreground font-medium">
                Análise automatizada com Inteligência Artificial
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
