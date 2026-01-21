"use client"

import { useEffect, useCallback } from "react"

// Simple format: { "ctrl+k": () => {}, "escape": () => {} }
type SimpleShortcuts = Record<string, () => void>

export function useKeyboardShortcuts(shortcuts: SimpleShortcuts, enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow escape key even in inputs
        if (event.key.toLowerCase() !== "escape") {
          return
        }
      }

      const key = event.key.toLowerCase()
      const hasCtrl = event.ctrlKey || event.metaKey
      const hasShift = event.shiftKey
      const hasAlt = event.altKey

      // Build shortcut string
      const parts: string[] = []
      if (hasCtrl) parts.push("ctrl")
      if (hasShift) parts.push("shift")
      if (hasAlt) parts.push("alt")
      parts.push(key)
      
      const shortcutKey = parts.join("+")

      // Check for match
      for (const [combo, action] of Object.entries(shortcuts)) {
        const normalizedCombo = combo.toLowerCase().replace(/\s/g, "")
        if (shortcutKey === normalizedCombo || key === normalizedCombo) {
          event.preventDefault()
          action()
          return
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

// Predefined shortcuts for dev dashboard
export const DEV_SHORTCUTS = {
  NEXT_TASK: { key: "j", description: "Proxima tarefa" },
  PREV_TASK: { key: "k", description: "Tarefa anterior" },
  OPEN_TASK: { key: "Enter", description: "Abrir tarefa" },
  CLOSE_MODAL: { key: "Escape", description: "Fechar modal" },
  START_TIMER: { key: "t", description: "Iniciar/parar timer" },
  TOGGLE_FOCUS: { key: "f", description: "Modo foco" },
  OPEN_AI: { key: "a", ctrl: true, description: "Abrir assistente IA" },
  MOVE_TODO: { key: "1", description: "Mover para To Do" },
  MOVE_PROGRESS: { key: "2", description: "Mover para Em Progresso" },
  MOVE_REVIEW: { key: "3", description: "Mover para Revisao" },
  MOVE_DONE: { key: "4", description: "Mover para Concluido" },
  SHOW_HELP: { key: "?", shift: true, description: "Mostrar ajuda" },
}
