"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, ChevronRight, Search, Lock, ArrowRight } from "lucide-react"
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
                  className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <Link
                    href="/solucoes/cnpj-detector"
                    onClick={() => setSolucoesOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        CNPJ Detector
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Analise e migre seus sistemas para o novo CNPJ alfanumerico
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Login CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/solucoes/cnpj-detector#login"
              className="group relative"
            >
              <div className="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm">
                <Lock className="h-4 w-4" />
                Entrar
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>

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
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
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

            <Link
              href="/solucoes/cnpj-detector"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-medium text-foreground">CNPJ Detector</span>
                <p className="text-xs text-muted-foreground">Migre para o CNPJ alfanumerico</p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Link>

            <div className="border-t border-border my-2" />

            <Link
              href="/solucoes/cnpj-detector#login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition-all"
            >
              <Lock className="h-4 w-4" />
              Entrar na Plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
