"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  required?: boolean
}

interface TaskChecklistProps {
  taskId: string
  checklist?: ChecklistItem[]
  onChecklistChange: (checklist: ChecklistItem[]) => void
  onComplete?: () => void
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "code_reviewed", label: "Codigo revisado", checked: false, required: true },
  { id: "code_tested", label: "Codigo testado localmente", checked: false, required: true },
  { id: "code_committed", label: "Codigo commitado", checked: false, required: true },
  { id: "pr_created", label: "Pull Request criado", checked: false, required: true },
  { id: "pr_approved", label: "Pull Request aprovado", checked: false },
  { id: "tests_passing", label: "Testes automatizados passando", checked: false },
  { id: "documentation", label: "Documentacao atualizada", checked: false },
]

export function TaskChecklist({ 
  taskId, 
  checklist: initialChecklist, 
  onChecklistChange,
  onComplete 
}: TaskChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initialChecklist?.length ? initialChecklist : DEFAULT_CHECKLIST
  )

  const handleCheckChange = (itemId: string, checked: boolean) => {
    const newChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, checked } : item
    )
    setChecklist(newChecklist)
    onChecklistChange(newChecklist)
  }

  const requiredItems = checklist.filter((item) => item.required)
  const completedRequired = requiredItems.filter((item) => item.checked).length
  const totalRequired = requiredItems.length
  const canComplete = completedRequired === totalRequired

  const progress = (checklist.filter((item) => item.checked).length / checklist.length) * 100

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Checklist de Conclusao</span>
          <Badge variant={canComplete ? "default" : "outline"} className={canComplete ? "bg-green-600" : ""}>
            {completedRequired}/{totalRequired} obrigatorios
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`flex items-start space-x-3 p-2 rounded-lg transition-colors ${
              item.checked ? "bg-green-50" : item.required ? "bg-orange-50" : "bg-gray-50"
            }`}
          >
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor={item.id}
                className={`text-sm cursor-pointer ${item.checked ? "line-through text-muted-foreground" : ""}`}
              >
                {item.label}
              </Label>
              {item.required && !item.checked && (
                <Badge variant="outline" className="ml-2 text-[10px] text-orange-600 border-orange-300">
                  Obrigatorio
                </Badge>
              )}
            </div>
            {item.checked ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : item.required ? (
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Complete message */}
      {!canComplete && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          Complete todos os itens obrigatorios para finalizar a tarefa
        </div>
      )}
    </div>
  )
}
