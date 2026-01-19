import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_id, status, developer_id } = body

    if (!repository_id || !status) {
      return NextResponse.json(
        { success: false, error: "repository_id e status sao obrigatorios" },
        { status: 400 }
      )
    }

    const validStatuses = ["pendente", "desenvolvimento", "finalizado"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status invalido. Use: pendente, desenvolvimento ou finalizado" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Atualiza o status na tabela repository_assignments
    const query = supabase
      .from("repository_assignments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("repository_id", repository_id)

    // Se developer_id foi fornecido, filtra por ele tambem
    if (developer_id) {
      query.eq("developer_id", developer_id)
    }

    const { data, error } = await query.select()

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Atribuicao nao encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Status atualizado com sucesso",
      data: data[0],
    })
  } catch (error: any) {
    console.error("[API] Update assignment status error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
