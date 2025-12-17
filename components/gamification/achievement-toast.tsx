"use client"

import { useEffect, useState } from "react"
import { Trophy, X, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AchievementToastProps {
  achievement: {
    name: string
    description: string
    points: number
    icon: string
  }
  onClose: () => void
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <Card className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-lg animate-bounce">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-semibold text-yellow-500">Conquista Desbloqueada!</p>
            </div>
            <h3 className="font-bold text-lg">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            <p className="text-sm font-semibold text-yellow-500 mt-2">+{achievement.points} pontos</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
