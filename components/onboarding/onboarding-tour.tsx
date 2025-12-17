"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react'

interface Step {
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
}

const onboardingSteps: Step[] = [
  {
    title: "Bem-vindo ao CNPJ Analyzer",
    description:
      "Este sistema analisa seus repositórios em busca de CNPJs e gera relatórios detalhados.",
    target: "body",
    position: "bottom",
  },
  {
    title: "Conecte suas Contas",
    description:
      "Primeiro, conecte suas contas GitHub, GitLab ou Azure DevOps na página de Integrações.",
    target: "[data-tour='integrations']",
    position: "bottom",
  },
  {
    title: "Inicie uma Análise",
    description:
      "Selecione um repositório e clique em 'Analisar' para começar a buscar CNPJs no código.",
    target: "[data-tour='analyzer']",
    position: "bottom",
  },
  {
    title: "Acompanhe o Progresso",
    description:
      "Você pode acompanhar o progresso em tempo real e ver quantos arquivos foram analisados.",
    target: "[data-tour='analyses']",
    position: "bottom",
  },
  {
    title: "Visualize Relatórios",
    description:
      "Após a conclusão, acesse os relatórios detalhados com findings, tarefas e estatísticas.",
    target: "[data-tour='reports']",
    position: "bottom",
  },
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboardingTour")
    if (!hasSeenTour) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboardingTour", "true")
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  const step = onboardingSteps[currentStep]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 m-4">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-6">{step.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep < onboardingSteps.length - 1 ? "Próximo" : "Concluir"}
              {currentStep < onboardingSteps.length - 1 && (
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
