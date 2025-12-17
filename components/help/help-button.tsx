"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, BookOpen, MessageCircle, RotateCcw } from "lucide-react"

interface HelpButtonProps {
  onRestartTour: () => void
}

export function HelpButton({ onRestartTour }: HelpButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Central de Ajuda</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRestartTour}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar Tour
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookOpen className="mr-2 h-4 w-4" />
            Documentação
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageCircle className="mr-2 h-4 w-4" />
            Suporte
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
