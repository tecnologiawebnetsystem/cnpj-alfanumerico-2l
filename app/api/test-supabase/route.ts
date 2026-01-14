import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  console.log(" === TEST SUPABASE START ===")

  try {
    // Test 1: Create client with service role
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    console.log(" Creating Supabase client...")
    console.log(" URL exists:", !!supabaseUrl)
    console.log(" Service key exists:", !!serviceRoleKey)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log(" Client created successfully")

    // Test 2: Simple query
    console.log(" Testing database query...")
    const { data: clients, error: clientsError } = await supabase.from("clients").select("id, name").limit(1)

    console.log(" Query completed")
    console.log(" Error:", clientsError)
    console.log(" Data:", clients)

    // Test 3: Users table
    console.log(" Testing users query...")
    const { data: users, error: usersError } = await supabase.from("users").select("id, email").limit(1)

    console.log(" Users query completed")
    console.log(" Users error:", usersError)
    console.log(" Users data:", users)

    return NextResponse.json({
      success: true,
      tests: {
        client_creation: "OK",
        clients_query: clientsError ? "FAILED" : "OK",
        clients_data: clients,
        clients_error: clientsError?.message,
        users_query: usersError ? "FAILED" : "OK",
        users_data: users,
        users_error: usersError?.message,
      },
    })
  } catch (error: any) {
    console.error(" === TEST FAILED ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
