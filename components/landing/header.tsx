"use client"

import { Button } from "@/components/ui/button"
import { Menu, BookOpen } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/images/image.png"
                alt="CNPJ Detector by ACT Digital"
                width={200}
                height={60}
                className="h-auto w-auto max-h-[40px]"
                priority
              />
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("solucao")}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Solução
              </button>
              <Link
                href="/wiki"
                className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Wiki
              </Link>
              <Link href="/documentacao" className="text-sm font-medium hover:text-primary transition-colors">
                Documentação
              </Link>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 shadow-lg" size="sm">
                  Login
                </Button>
              </Link>
            </nav>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t border-border">
              <button
                onClick={() => scrollToSection("solucao")}
                className="block w-full text-left text-sm font-medium hover:text-primary transition-colors"
              >
                Solução
              </button>
              <Link
                href="/wiki"
                className="block w-full text-left text-sm font-medium hover:text-primary transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Wiki
                </span>
              </Link>
              <Link
                href="/documentacao"
                className="block w-full text-left text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentação
              </Link>
              <Link href="/login" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90" size="sm">
                  Login
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
