"use client"

import { Shield, FileCheck, Clock } from "lucide-react"
import { Logo } from "./logo"

export function Footer() {
  return (
    <footer className="bg-muted/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <Logo className="h-12 w-auto" />
            </div>
            <h3 className="font-semibold mb-3">CNPJ Alfanumérico</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Solução completa para análise e migração de sistemas para o novo formato de CNPJ Alfanumérico, obrigatório
              a partir de julho de 2026.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Sobre o CNPJ Alfanumérico</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Análise automatizada de código e banco de dados para identificar campos CNPJ</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Relatórios detalhados em PDF, JSON e Markdown com sugestões de correção</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Estimativa precisa de horas de trabalho para implementação das mudanças</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CNPJ Alfanumérico. Todos os direitos reservados.</p>
          <p className="mt-2 font-medium">
            CNPJ Alfanumérico - Prepare sua empresa para a mudança obrigatória de julho/2026
          </p>
          <p className="mt-2 text-xs">
            Solução especializada para seguradoras, empresas de capitalização, saúde e organizações que precisam se
            adequar ao novo formato de CNPJ com 20 caracteres alfanuméricos.
          </p>
        </div>
      </div>
    </footer>
  )
}
