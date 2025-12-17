"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronRight, ChevronLeft } from "lucide-react"

interface WelcomeTourProps {
  onComplete: () => void
}

const tourSteps = [
  {
    title: "Bem-vindo ao Sistema CNPJ!",
    description: "Vamos fazer um tour rápido para você conhecer as principais funcionalidades do sistema.",
    target: null,
  },
  {
    title: "Visão Geral",
    description: "Aqui você vê um resumo de todas as suas atividades, análises recentes e estatísticas importantes.",
    target: "overview",
  },
  {
    title: "Análises de CNPJ",
    description: "Clique aqui para analisar CNPJs e verificar se estão no formato alfanumérico correto.",
    target: "analyzer",
  },
  {
    title: "Gerenciamento de Tarefas",
    description: "Organize suas tarefas e acompanhe o progresso do seu trabalho.",
    target: "tasks",
  },
  {
    title: "Board de Sprints",
    description: "Gerencie suas sprints com um board Kanban visual. Perfeito para equipes ágeis!",
    target: "sprints",
  },
  {
    title: "Configurações",
    description: "Configure integrações, notificações e personalize o sistema de acordo com suas necessidades.",
    target: "settings",
  },
]

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const step = tourSteps[currentStep]

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription className="mt-2">{step.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {tourSteps.length}
            </span>
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? "Concluir" : "Próximo"}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
