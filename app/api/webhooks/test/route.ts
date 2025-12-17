import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// POST /api/webhooks/test - Test webhook
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { webhook_id } = body

    const supabase = await createClient()

    // Get webhook
    const { data: webhook, error: fetchError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("id", webhook_id)
      .eq("client_id", user.client_id)
      .single()

    if (fetchError) throw fetchError

    // Send test payload
    const testPayload = {
      event: "test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook",
      },
    }

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhook.secret,
        },
        body: JSON.stringify(testPayload),
      })

      // Log webhook execution
      await supabase.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: "test",
        payload: testPayload,
        response_status: response.status,
        response_body: await response.text(),
      })

      return NextResponse.json({
        success: response.ok,
        status: response.status,
      })
    } catch (webhookError: any) {
      // Log error
      await supabase.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: "test",
        payload: testPayload,
        error_message: webhookError.message,
      })

      return NextResponse.json(
        {
          success: false,
          error: webhookError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Error testing webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
