import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  console.log(" === DIAGNOSTIC START ===")

  const diagnostics = {
    timestamp: new Date().toISOString(),
    env_check: {
      supabase_url: !!process.env.SUPABASE_URL,
      supabase_anon_key: !!process.env.SUPABASE_ANON_KEY,
      supabase_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      next_public_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      next_public_supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    env_values: {
      supabase_url: process.env.SUPABASE_URL?.substring(0, 30) + "...",
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
    },
    runtime: {
      platform: process.platform,
      node_version: process.version,
    },
  }

  console.log(" Diagnostics:", JSON.stringify(diagnostics, null, 2))
  console.log(" === DIAGNOSTIC END ===")

  return NextResponse.json(diagnostics)
}
