"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsHelpProps {
  isOpen?: boolean
  onClose?: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcutGroups = [
    {
      title: "Navegacao",
      shortcuts: [
        { description: "Alternar para Board", keys: ["Ctrl", "1"] },
        { description: "Alternar para Historico", keys: ["Ctrl", "2"] },
        { description: "Alternar para Conquistas", keys: ["Ctrl", "3"] },
        { description: "Alternar para Notificacoes", keys: ["Ctrl", "4"] },
        { description: "Fechar modais", keys: ["Esc"] },
      ],
    },
    {
      title: "Acoes",
      shortcuts: [
        { description: "Abrir Assistente IA", keys: ["Ctrl", "K"] },
        { description: "Modo Foco", keys: ["Ctrl", "F"] },
        { description: "Mostrar esta ajuda", keys: ["?"] },
      ],
    },
  ]

  const onOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{group.title}</h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <Badge key={j} variant="outline" className="font-mono text-xs px-2">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Pressione <Badge variant="outline" className="font-mono text-xs mx-1">Shift</Badge>+<Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> a qualquer momento para ver esta ajuda
        </div>
      </DialogContent>
    </Dialog>
  )
}
