import { NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const { data: clients, error: clientsError } = await db.from("clients").select("id, name").limit(1)
    const { data: users, error: usersError } = await db.from("users").select("id, email").limit(1)

    return NextResponse.json({
      success: true,
      database: "SQL Server",
      tests: {
        clients_query: clientsError ? "FAILED" : "OK",
        clients_data: clients,
        clients_error: clientsError?.message,
        users_query: usersError ? "FAILED" : "OK",
        users_data: users,
        users_error: usersError?.message,
      },
    })
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
