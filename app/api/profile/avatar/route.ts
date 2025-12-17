import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      },
    )

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json({ error: "File and userId required" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-assets")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from("user-assets").getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("id", userId)

    if (updateError) throw updateError

    return NextResponse.json({ avatar_url: publicUrlData.publicUrl })
  } catch (error: any) {
    console.error("[API] Error uploading avatar:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
