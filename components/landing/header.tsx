"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight, Sparkles, Code2, BookOpen, LogIn } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  const navItems = [
    { id: "solucao", label: "Solucao", icon: Sparkles },
    { id: "validador", label: "Validador", icon: Code2 },
    { id: "exemplos", label: "Exemplos", icon: BookOpen },
  ]

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled 
            ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl shadow-black/20" 
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl p-2.5 shadow-lg">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  CNPJ<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Detector</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase -mt-0.5">
                  Migration Tool
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              {/* Floating Nav Pill */}
              <div className="flex items-center gap-1 bg-zinc-900/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-zinc-800/50">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      onMouseEnter={() => setActiveItem(item.id)}
                      onMouseLeave={() => setActiveItem(null)}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        activeItem === item.id
                          ? "text-white bg-zinc-800"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 transition-all duration-300",
                        activeItem === item.id ? "text-blue-400" : ""
                      )} />
                      {item.label}
                      {activeItem === item.id && (
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Wiki Link */}
              <Link 
                href="/wiki"
                className="ml-6 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
              >
                <BookOpen className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
                Wiki
              </Link>

              {/* Login Button */}
              <Link 
                href="/login"
                className="ml-6 group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-all duration-300" />
                <div className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25">
                  <LogIn className="h-4 w-4" />
                  Entrar
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden absolute top-full left-0 right-0 transition-all duration-500 overflow-hidden",
          mobileMenuOpen 
            ? "max-h-[500px] opacity-100" 
            : "max-h-0 opacity-0"
        )}>
          <div className="bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl shadow-black/40">
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="flex items-center gap-4 w-full p-4 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="h-5 w-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
              
              <div className="border-t border-zinc-800/50 my-4" />
              
              <Link
                href="/wiki"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 w-full p-4 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all group"
              >
                <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-blue-500/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="font-medium">Wiki / Documentacao</span>
                <ChevronRight className="h-4 w-4 ml-auto text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full p-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                <LogIn className="h-5 w-5" />
                Entrar na Plataforma
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  )
}
