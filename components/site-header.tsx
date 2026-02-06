"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  ArrowRightLeft,
  CreditCard,
  MapPin,
  Server,
  FileCheck,
  Landmark,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [solucoesOpen, setSolucoesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSolucoesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl overflow-hidden shadow-sm border border-border">
              <Image
                src="/images/act-logo-horizontal.jpeg"
                alt="ACT Digital"
                width={110}
                height={44}
                className="object-cover"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              Reforma Tributaria
            </Link>

            {/* Solucoes Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onMouseEnter={() => setSolucoesOpen(true)}
                onClick={() => setSolucoesOpen(!solucoesOpen)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                Solucoes
                <ChevronDown className={cn("h-4 w-4 transition-transform", solucoesOpen && "rotate-180")} />
              </button>

              {solucoesOpen && (
                <div
                  onMouseLeave={() => setSolucoesOpen(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] bg-card border border-border rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Solucoes ACT Digital
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { href: "/solucoes/cnpj-detector", icon: Search, color: "#0052CC", name: "CNPJ Detector", desc: "Migracao para CNPJ alfanumerico" },
                      { href: "/solucoes/nfe-reform-adapter", icon: FileText, color: "#0052CC", name: "NF-e Reform Adapter", desc: "Adaptacao de notas fiscais CBS/IBS" },
                      { href: "/solucoes/tax-rule-migrator", icon: ArrowRightLeft, color: "#E67E22", name: "Tax Rule Migrator", desc: "Migracao de regras tributarias" },
                      { href: "/solucoes/split-payment-inspector", icon: CreditCard, color: "#27AE60", name: "Split Payment Inspector", desc: "Adaptacao de sistemas de pagamento" },
                      { href: "/solucoes/nfse-harmonizer", icon: MapPin, color: "#8E44AD", name: "NFS-e Harmonizer", desc: "Compatibilizacao multi-municipal" },
                      { href: "/solucoes/erp-compliance-scanner", icon: Server, color: "#2980B9", name: "ERP Compliance Scanner", desc: "Diagnostico de aderencia ERP" },
                      { href: "/solucoes/fiscal-document-validator", icon: FileCheck, color: "#C0392B", name: "Fiscal Document Validator", desc: "Validacao pre-envio ao SEFAZ" },
                      { href: "/solucoes/dere-builder", icon: Landmark, color: "#16A085", name: "DeRE Builder", desc: "Declaracao de regimes especificos" },
                    ].map((sol) => (
                      <Link
                        key={sol.href}
                        href={sol.href}
                        onClick={() => setSolucoesOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div
                          className="p-1.5 rounded-lg mt-0.5 shrink-0"
                          style={{ backgroundColor: `${sol.color}15` }}
                        >
                          <sol.icon className="h-4 w-4" style={{ color: sol.color }} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                            {sol.name}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {sol.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-all"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 transition-all duration-300 overflow-hidden",
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-background/98 backdrop-blur-xl border-b border-border shadow-xl">
          <div className="container mx-auto px-4 py-6 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
            >
              <span className="font-medium">Reforma Tributaria</span>
            </Link>

            <div className="border-t border-border my-2" />

            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Solucoes
            </p>

            {[
              { href: "/solucoes/cnpj-detector", icon: Search, color: "#0052CC", name: "CNPJ Detector", desc: "Migracao CNPJ alfanumerico" },
              { href: "/solucoes/nfe-reform-adapter", icon: FileText, color: "#0052CC", name: "NF-e Reform Adapter", desc: "Adaptacao notas fiscais CBS/IBS" },
              { href: "/solucoes/tax-rule-migrator", icon: ArrowRightLeft, color: "#E67E22", name: "Tax Rule Migrator", desc: "Migracao regras tributarias" },
              { href: "/solucoes/split-payment-inspector", icon: CreditCard, color: "#27AE60", name: "Split Payment Inspector", desc: "Sistemas de pagamento" },
              { href: "/solucoes/nfse-harmonizer", icon: MapPin, color: "#8E44AD", name: "NFS-e Harmonizer", desc: "Compatibilizacao municipal" },
              { href: "/solucoes/erp-compliance-scanner", icon: Server, color: "#2980B9", name: "ERP Compliance Scanner", desc: "Diagnostico ERP" },
              { href: "/solucoes/fiscal-document-validator", icon: FileCheck, color: "#C0392B", name: "Fiscal Document Validator", desc: "Validacao pre-SEFAZ" },
              { href: "/solucoes/dere-builder", icon: Landmark, color: "#16A085", name: "DeRE Builder", desc: "Regimes especificos" },
            ].map((sol) => (
              <Link
                key={sol.href}
                href={sol.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ backgroundColor: `${sol.color}15` }}
                >
                  <sol.icon className="h-4 w-4" style={{ color: sol.color }} />
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-foreground block truncate">{sol.name}</span>
                  <p className="text-xs text-muted-foreground truncate">{sol.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground shrink-0" />
              </Link>
            ))}


          </div>
        </div>
      </div>
    </header>
  )
}
