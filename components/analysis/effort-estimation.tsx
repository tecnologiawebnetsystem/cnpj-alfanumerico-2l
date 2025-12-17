import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, TrendingUp, Users } from "lucide-react"

export function EffortEstimation({ estimatedHours, findingsCount }: { estimatedHours: number; findingsCount: number }) {
  const days = Math.ceil(estimatedHours / 8)
  const complexity = findingsCount < 10 ? "Baixa" : findingsCount < 30 ? "Média" : "Alta"
  const complexityColor =
    findingsCount < 10 ? "text-green-600" : findingsCount < 30 ? "text-yellow-600" : "text-red-600"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimativa de Esforço</CardTitle>
        <CardDescription>Tempo estimado para realizar todas as alterações necessárias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Tempo Total</span>
            </div>
            <div className="text-3xl font-bold">{estimatedHours}h</div>
            <p className="text-xs text-muted-foreground">
              Aproximadamente {days} dia{days !== 1 ? "s" : ""} de trabalho
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Complexidade</span>
            </div>
            <div className={`text-3xl font-bold ${complexityColor}`}>{complexity}</div>
            <p className="text-xs text-muted-foreground">Baseado em {findingsCount} ocorrências</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Recomendação</span>
            </div>
            <div className="text-3xl font-bold">{Math.ceil(estimatedHours / 40)}</div>
            <p className="text-xs text-muted-foreground">
              Desenvolvedor{Math.ceil(estimatedHours / 40) !== 1 ? "es" : ""} recomendado
              {Math.ceil(estimatedHours / 40) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso até julho/2026</span>
            <span className="font-medium">Tempo disponível</span>
          </div>
          <Progress value={0} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Inicie as alterações o quanto antes para garantir a conformidade
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
