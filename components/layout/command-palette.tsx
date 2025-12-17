"use client"

import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRouter } from 'next/navigation'
import { SearchIcon, FileTextIcon, SettingsIcon, BarChartIcon, GitBranchIcon } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navigate = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => navigate("/analyzer")}>
            <SearchIcon className="mr-2 h-4 w-4" />
            <span>Nova Análise</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard")}>
            <BarChartIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/integrations")}>
            <GitBranchIcon className="mr-2 h-4 w-4" />
            <span>Integrações</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/reports")}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            <span>Relatórios</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
