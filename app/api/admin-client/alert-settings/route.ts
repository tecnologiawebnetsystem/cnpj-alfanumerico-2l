import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "client_id required" }, { status: 400 })
    }

    // Try to get existing settings from client_settings
    const { data: settingsRows } = await supabase
      .from("client_settings")
      .select("setting_value")
      .eq("client_id", clientId)
      .eq("setting_key", "alert_settings")
      .limit(1)

    const settingsRow = settingsRows?.[0]
    if (settingsRow?.setting_value) {
      try {
        const settings = JSON.parse(settingsRow.setting_value)
        return NextResponse.json({ settings })
      } catch {
        // Invalid JSON, return defaults
      }
    }

    // Return default settings
    return NextResponse.json({
      settings: {
        analysisComplete: true,
        taskOverdue: true,
        criticalFinding: true,
        weeklyReport: false,
        emailNotifications: false
      }
    })
  } catch (error: any) {
    console.error("Error fetching alert settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { client_id, settings } = body

    if (!client_id || !settings) {
      return NextResponse.json({ error: "client_id and settings required" }, { status: 400 })
    }

    // Upsert the settings
    const { error } = await supabase
      .from("client_settings")
      .upsert({
        client_id,
        setting_key: "alert_settings",
        setting_value: JSON.stringify(settings),
        updated_at: new Date().toISOString()
      }, {
        onConflict: "client_id,setting_key"
      })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving alert settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
