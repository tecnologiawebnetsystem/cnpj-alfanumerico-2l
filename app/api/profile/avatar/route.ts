import { type NextRequest, NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json({ error: "File and userId required" }, { status: 400 })
    }

    // Upload to Vercel Blob (replaces Supabase Storage)
    const blob = await put(`avatars/${userId}-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    })

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: blob.url })
      .eq("id", userId)

    if (updateError) throw updateError

    return NextResponse.json({ avatar_url: blob.url })
  } catch (error: any) {
    console.error("[API] Error uploading avatar:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
