"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Brain, BarChart3, TrendingUp, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface AIAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  fixtureId: number
  fixtureName: string
}

const ANALYSIS_STEPS = [
  { 
    icon: Brain, 
    title: "Iniciando Análise Inteligente", 
    description: "Conectando com nossa IA avançada..."
  },
  { 
    icon: BarChart3, 
    title: "Coletando Dados", 
    description: "Analisando estatísticas e histórico das equipes..."
  },
  { 
    icon: TrendingUp, 
    title: "Processando Head-to-Head", 
    description: "Avaliando confrontos diretos e tendências..."
  },
  { 
    icon: Zap, 
    title: "Gerando Predições", 
    description: "Calculando probabilidades e insights finais..."
  }
]

export function AIAnalysisModal({ isOpen, onClose, fixtureId, fixtureName }: AIAnalysisModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return

    // Reset state when modal opens
    setCurrentStep(0)
    setIsCompleted(false)

    // Simulate analysis steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1
        } else {
          setIsCompleted(true)
          clearInterval(stepInterval)
          // Navigate to detailed analysis page after completion
          setTimeout(() => {
            router.push(`/analise/${fixtureId}`)
            onClose()
          }, 1500)
          return prev
        }
      })
    }, 1500) // Each step takes 1.5 seconds

    return () => clearInterval(stepInterval)
  }, [isOpen, fixtureId, router, onClose])

  const CurrentIcon = ANALYSIS_STEPS[currentStep]?.icon || Brain

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Análise Inteligente
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          {/* AI Icon with pulsing animation */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary-forbet/20 animate-ping"></div>
            <div className="relative rounded-full bg-gradient-to-br from-primary-forbet to-secondary-forbet p-4">
              <CurrentIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Fixture name */}
          <h3 className="text-center font-semibold text-foreground max-w-xs">
            {fixtureName}
          </h3>

          {/* Current step */}
          {!isCompleted ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-forbet" />
                <h4 className="font-medium text-primary-forbet">
                  {ANALYSIS_STEPS[currentStep]?.title}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {ANALYSIS_STEPS[currentStep]?.description}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-600">
                  Análise Concluída!
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o relatório completo...
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{isCompleted ? 100 : Math.round(((currentStep + 1) / ANALYSIS_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-primary-forbet to-secondary-forbet h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${isCompleted ? 100 : ((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-center space-x-2">
            {ANALYSIS_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep 
                    ? 'bg-primary-forbet' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cancel button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full max-w-xs"
            disabled={isCompleted}
          >
            {isCompleted ? "Redirecionando..." : "Cancelar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 