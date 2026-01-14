import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/help/articles/[slug] - Get single help article
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient()

    const { data: article, error } = await supabase
      .from("help_articles")
      .select("*")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .single()

    if (error) throw error

    // Increment view count
    await supabase
      .from("help_articles")
      .update({ view_count: (article.view_count || 0) + 1 })
      .eq("id", article.id)

    return NextResponse.json({ article })
  } catch (error: any) {
    console.error(" Error fetching help article:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
