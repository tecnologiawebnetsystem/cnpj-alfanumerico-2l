import { ActivityFeed } from "@/components/collaboration/activity-feed"
import { Card } from "@/components/ui/card"
import { Activity, Clock, Users, TrendingUp } from "lucide-react"

export default function ActivityPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Feed de Atividades
        </h1>
        <p className="text-muted-foreground">Acompanhe todas as ações e mudanças no sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Atividades Hoje</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Usuários Ativos</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última Atividade</p>
              <p className="text-sm font-semibold">2 min atrás</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tendência</p>
              <p className="text-sm font-semibold text-green-600">+15%</p>
            </div>
          </div>
        </Card>
      </div>

      <ActivityFeed limit={50} />
    </div>
  )
}
