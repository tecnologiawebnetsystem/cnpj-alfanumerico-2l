"use client"
import { Menu } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-end">
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("solucao")}
                className="text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Solução
              </button>
              <button
                onClick={() => scrollToSection("validador")}
                className="text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Validador
              </button>
              <button
                onClick={() => scrollToSection("exemplos")}
                className="text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Exemplos
              </button>
              <button
                onClick={() => scrollToSection("login")}
                className="text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Login
              </button>
            </nav>

            <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 bg-white rounded-lg shadow-lg mt-2 p-4">
              <button
                onClick={() => scrollToSection("solucao")}
                className="block w-full text-left text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Solução
              </button>
              <button
                onClick={() => scrollToSection("validador")}
                className="block w-full text-left text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Validador
              </button>
              <button
                onClick={() => scrollToSection("exemplos")}
                className="block w-full text-left text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Exemplos
              </button>
              <button
                onClick={() => scrollToSection("login")}
                className="block w-full text-left text-sm font-medium text-gray-700 hover:text-[#0052CC] transition-colors"
              >
                Login
              </button>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
