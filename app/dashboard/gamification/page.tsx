import { AchievementsPanel } from "@/components/gamification/achievements-panel"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { StreakCounter } from "@/components/gamification/streak-counter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users } from "lucide-react"

export default function GamificationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gamificação</h1>
        <p className="text-muted-foreground">Conquistas, ranking e estatísticas de progresso</p>
      </div>

      <div className="mb-6">
        <StreakCounter />
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <AchievementsPanel />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
