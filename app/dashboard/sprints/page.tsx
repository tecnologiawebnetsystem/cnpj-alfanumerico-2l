import { createServerClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { SprintBoard } from "@/components/sprints/sprint-board"
import { SprintList } from "@/components/sprints/sprint-list"
import { CreateSprintButton } from "@/components/sprints/create-sprint-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function SprintsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Buscar dados do usuário
  const { data: userData } = await supabase.from("users").select("*, clients(*)").eq("id", user.id).single()

  if (!userData) {
    redirect("/login")
  }

  // Buscar sprints do cliente
  const { data: sprints } = await supabase
    .from("sprints")
    .select("*")
    .eq("client_id", userData.client_id)
    .order("created_at", { ascending: false })

  // Buscar sprint ativa
  const activeSprint = sprints?.find((s) => s.status === "active")

  // Buscar tasks da sprint ativa
  const { data: sprintTasks } = activeSprint
    ? await supabase
        .from("tasks")
        .select("*, assigned_to_user:assigned_to(name, email)")
        .eq("sprint_id", activeSprint.id)
        .order("backlog_priority", { ascending: true })
    : { data: [] }

  // Buscar backlog (tasks sem sprint)
  const { data: backlogTasks } = await supabase
    .from("tasks")
    .select("*, assigned_to_user:assigned_to(name, email)")
    .eq("client_id", userData.client_id)
    .is("sprint_id", null)
    .order("backlog_priority", { ascending: true })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento Ágil</h1>
          <p className="text-muted-foreground">Gerencie sprints, backlog e acompanhe o progresso da equipe</p>
        </div>
        <CreateSprintButton clientId={userData.client_id} />
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Board da Sprint</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="sprints">Todas as Sprints</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          {activeSprint ? (
            <SprintBoard sprint={activeSprint} tasks={sprintTasks || []} clientId={userData.client_id} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Nenhuma sprint ativa</h3>
              <p className="text-muted-foreground mb-4">Crie uma nova sprint para começar a gerenciar suas tarefas</p>
              <CreateSprintButton clientId={userData.client_id} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="backlog" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Product Backlog</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Arraste as tarefas para priorizar. Menor número = maior prioridade.
            </p>
            {backlogTasks && backlogTasks.length > 0 ? (
              <div className="space-y-2">
                {backlogTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      {task.user_story && <p className="text-sm text-muted-foreground mt-1">{task.user_story}</p>}
                    </div>
                    {task.story_points > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-semibold">{task.story_points}</span>
                        <span className="text-muted-foreground">pts</span>
                      </div>
                    )}
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {task.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma tarefa no backlog</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4">
          <SprintList sprints={sprints || []} clientId={userData.client_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
