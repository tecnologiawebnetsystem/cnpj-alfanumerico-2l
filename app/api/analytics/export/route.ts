import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get("format") || "excel"
  const period = searchParams.get("period") || "30d"

  try {
    // Buscar dados de analytics
    const { data: analyses } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const { data: clients } = await supabase.from("clients").select("*")

    if (format === "excel") {
      // Gerar CSV simples (compatível com Excel)
      const csvRows = [
        ["Tipo", "ID", "Nome/Título", "Status", "Data de Criação"],
        ...(analyses?.map((a: any) => ["Análise", a.id, a.repository_url || "N/A", a.status, a.created_at]) || []),
        ...(tasks?.map((t: any) => ["Tarefa", t.id, t.title || "N/A", t.status, t.created_at]) || []),
        ...(clients?.map((c: any) => ["Cliente", c.id, c.name, c.status || "active", c.created_at]) || []),
      ]

      const csvContent = csvRows.map((row) => row.join(",")).join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="analytics-${period}.csv"`,
        },
      })
    }

    if (format === "pdf") {
      // Gerar relatório em texto simples (futuro: usar jsPDF)
      const pdfContent = `
RELATÓRIO DE ANALYTICS - ${period.toUpperCase()}
================================================

RESUMO GERAL
------------
Total de Análises: ${analyses?.length || 0}
Total de Tarefas: ${tasks?.length || 0}
Total de Clientes: ${clients?.length || 0}

ANÁLISES RECENTES
-----------------
${
  analyses
    ?.slice(0, 10)
    .map((a: any, i: number) => `${i + 1}. ${a.repository_url || "N/A"} - Status: ${a.status}`)
    .join("\n") || "Nenhuma análise"
}

TAREFAS RECENTES
----------------
${
  tasks
    ?.slice(0, 10)
    .map((t: any, i: number) => `${i + 1}. ${t.title || "N/A"} - Status: ${t.status}`)
    .join("\n") || "Nenhuma tarefa"
}

CLIENTES ATIVOS
---------------
${clients?.map((c: any, i: number) => `${i + 1}. ${c.name}`).join("\n") || "Nenhum cliente"}

Relatório gerado em: ${new Date().toLocaleString("pt-BR")}
      `

      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="analytics-${period}.txt"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error: any) {
    console.error("[v0] Export analytics error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
