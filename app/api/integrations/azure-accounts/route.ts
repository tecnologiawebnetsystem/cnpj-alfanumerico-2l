import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/integrations/azure-accounts - List all Azure DevOps accounts for client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's client_id
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("client_id")
      .eq("id", user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch all Azure DevOps accounts for this client
    const { data: accounts, error: accountsError } = await supabase
      .from("integration_accounts")
      .select("*")
      .eq("client_id", userData.client_id)
      .eq("provider", "azure")
      .order("account_name", { ascending: true })

    if (accountsError) {
      console.error("[v0] Error fetching Azure accounts:", accountsError)
      return NextResponse.json({ error: accountsError.message }, { status: 500 })
    }

    // Group by organization
    const grouped = accounts.reduce((acc: any, account: any) => {
      const org = account.account_name
      if (!acc[org]) {
        acc[org] = {
          organization: org,
          projects: []
        }
      }
      if (account.project) {
        acc[org].projects.push({
          id: account.id,
          name: account.project,
          is_active: account.is_active,
          last_used: account.last_used_at
        })
      }
      return acc
    }, {})

    return NextResponse.json({
      accounts: Object.values(grouped),
      total: accounts.length
    })

  } catch (error: any) {
    console.error("[v0] Error in azure-accounts route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/integrations/azure-accounts - Add new Azure DevOps account (org+project)
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("client_id")
      .eq("id", user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { organization, project, token } = body

    if (!organization || !project || !token) {
      return NextResponse.json({ 
        error: "Missing required fields: organization, project, token" 
      }, { status: 400 })
    }

    let baseUrl = "https://dev.azure.com"
    let org = organization
    
    if (organization.includes("://")) {
      const urlMatch = organization.match(/(https?:\/\/[^\/]+)\/(.+)/)
      if (urlMatch) {
        baseUrl = urlMatch[1]
        org = urlMatch[2]
        console.log(`[v0] Using custom Azure base URL: ${baseUrl}`)
      }
    }

    // Validate token by testing Azure DevOps API
    const testUrl = `${baseUrl}/${org}/${project}/_apis/git/repositories?api-version=7.0`
    const testResponse = await fetch(testUrl, {
      headers: {
        "Authorization": `Basic ${Buffer.from(`:${token}`).toString("base64")}`,
        "Content-Type": "application/json"
      }
    })

    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: "Invalid Azure DevOps credentials or project" 
      }, { status: 400 })
    }

    // Insert new account
    const { data: newAccount, error: insertError } = await supabase
      .from("integration_accounts")
      .insert({
        client_id: userData.client_id,
        user_id: user.id,
        provider: "azure",
        account_name: organization,
        project: project,
        access_token: token,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error inserting Azure account:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      account: newAccount 
    })

  } catch (error: any) {
    console.error("[v0] Error in POST azure-accounts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
