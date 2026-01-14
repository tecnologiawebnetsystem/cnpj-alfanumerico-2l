import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  console.log(" Creating Supabase client with:")
  console.log(" URL:", supabaseUrl)
  console.log(" Key length:", supabaseKey?.length || 0)
  console.log(" Key first 20 chars:", supabaseKey?.substring(0, 20))

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    console.log(" === GET /api/accounts START ===")

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    console.log(" User ID from params:", userId)

    if (!userId) {
      console.log(" No user_id provided")
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    console.log(" Querying github_tokens table...")
    const { data: accounts, error } = await supabase
      .from("github_tokens")
      .select("id, provider, account_name, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(" Error fetching accounts:", error)
      throw error
    }

    console.log(" Found", accounts?.length || 0, "accounts")
    console.log(" === GET /api/accounts END ===")

    return NextResponse.json({ accounts: accounts || [] })
  } catch (error: any) {
    console.error(" CRITICAL Error in GET /api/accounts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
