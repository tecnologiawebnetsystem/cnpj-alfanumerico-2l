import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('[v0] Debug ENV endpoint called')
  
  const envVars = {
    SUPABASE_URL: {
      exists: !!process.env.SUPABASE_URL,
      length: process.env.SUPABASE_URL?.length || 0,
      value: process.env.SUPABASE_URL,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      firstChars: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30),
    },
    SUPABASE_ANON_KEY: {
      exists: !!process.env.SUPABASE_ANON_KEY,
      length: process.env.SUPABASE_ANON_KEY?.length || 0,
      firstChars: process.env.SUPABASE_ANON_KEY?.substring(0, 30),
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      firstChars: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30),
    },
  }

  console.log('[v0] Environment variables check:', JSON.stringify(envVars, null, 2))

  return NextResponse.json({
    message: 'Environment variables diagnostic',
    variables: envVars,
    expectedLengths: {
      SERVICE_ROLE_KEY: 271,
      ANON_KEY: 271,
    }
  })
}
