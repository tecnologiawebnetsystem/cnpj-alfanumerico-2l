"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DevAssignmentsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para a página de tarefas do desenvolvedor
    router.replace("/dev/tasks")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  )
}
