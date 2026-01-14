import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log(" === SETTINGS API GET START ===")
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")
    console.log(" Requested client_id:", client_id)

    if (!client_id) {
      console.log(" No client_id provided")
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const supabase = await createClient()
    console.log(" Supabase client created")
    console.log(" Target client_id:", client_id)
    console.log(" Fetching settings from database...")

    const { data: settings, error } = await supabase
      .from("client_settings")
      .select("setting_key, setting_value")
      .eq("client_id", client_id)

    console.log(" Settings query result:", settings, "Error:", error)

    if (error) {
      console.error(" Database error:", error)
      throw error
    }

    const settingsObject: Record<string, any> = {}
    settings?.forEach((setting) => {
      try {
        settingsObject[setting.setting_key] = JSON.parse(setting.setting_value)
      } catch {
        // If not JSON, use as-is
        settingsObject[setting.setting_key] = setting.setting_value
      }
    })

    console.log(" Settings object:", settingsObject)
    console.log(" === SETTINGS API GET END (SUCCESS) ===")

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error(" === SETTINGS API GET ERROR ===", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(" === SETTINGS API POST START ===")

    const { client_id, cnpj_field_names, file_extensions } = await request.json()

    console.log(" POST client_id:", client_id)
    console.log(" CNPJ fields (raw from client):", cnpj_field_names, typeof cnpj_field_names)
    console.log(" File extensions (raw from client):", file_extensions, typeof file_extensions)

    if (!client_id) {
      console.log(" No client_id provided")
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Upsert CNPJ field names
    if (cnpj_field_names !== undefined) {
      console.log(" Upserting CNPJ field names...")

      // Parse if string, use as-is if array
      let cnpjArray: string[]

      if (typeof cnpj_field_names === "string") {
        cnpjArray = cnpj_field_names
          .split(",")
          .map((f: string) => f.trim())
          .filter((f: string) => f)
          .map((f: string) => {
            const cleaned = f.replace(/^\/(.+)\/[gimuy]*$/, "$1")
            console.log(`   Cleaned "${f}" -> "${cleaned}"`)
            return cleaned
          })
      } else if (Array.isArray(cnpj_field_names)) {
        cnpjArray = cnpj_field_names
          .map((f: any) => String(f).trim())
          .filter((f: string) => f)
          .map((f: string) => {
            const cleaned = f.replace(/^\/(.+)\/[gimuy]*$/, "$1")
            console.log(`   Cleaned "${f}" -> "${cleaned}"`)
            return cleaned
          })
      } else {
        cnpjArray = []
      }

      console.log(" CNPJ array to save:", cnpjArray)
      console.log(" CNPJ array length:", cnpjArray.length)

      const { error: cnpjError } = await supabase.from("client_settings").upsert(
        {
          client_id: client_id,
          setting_key: "cnpj_field_names",
          setting_value: JSON.stringify(cnpjArray),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "client_id,setting_key",
        },
      )

      if (cnpjError) {
        console.error(" CNPJ upsert error:", cnpjError)
        throw cnpjError
      }
      console.log(" CNPJ field names saved successfully!")
    }

    // Upsert file extensions
    if (file_extensions !== undefined) {
      console.log(" Upserting file extensions...")

      // Parse if string, use as-is if array
      const extArray =
        typeof file_extensions === "string"
          ? file_extensions
              .split(",")
              .map((e: string) => e.trim())
              .filter((e: string) => e)
          : file_extensions

      console.log(" Extensions array to save:", extArray)
      console.log(" Extensions array length:", extArray.length)

      const { error: extError } = await supabase.from("client_settings").upsert(
        {
          client_id: client_id,
          setting_key: "file_extensions",
          setting_value: JSON.stringify(extArray),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "client_id,setting_key",
        },
      )

      if (extError) {
        console.error(" Extensions upsert error:", extError)
        throw extError
      }
      console.log(" File extensions saved successfully!")
    }

    console.log(" === SETTINGS API POST END (SUCCESS) ===")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" === SETTINGS API POST ERROR ===", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
