import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/help/articles - Get help articles (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const supabase = await createClient()

    let query = supabase
      .from("help_articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.textSearch("search_vector", search)
    }

    const { data: articles, error } = await query

    if (error) throw error

    return NextResponse.json({ articles })
  } catch (error: any) {
    console.error(" Error fetching help articles:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
