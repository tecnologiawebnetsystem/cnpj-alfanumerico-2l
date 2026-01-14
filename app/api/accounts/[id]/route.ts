import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: account, error } = await supabase
      .from("github_tokens")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) throw error

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Não retornar o access_token
    const { access_token, ...accountData } = account

    return NextResponse.json({ account: accountData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { account_name } = await request.json()

    if (!account_name || account_name.trim() === "") {
      return NextResponse.json(
        { error: "Account name is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("github_tokens")
      .update({ account_name: account_name.trim() })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: "Account name updated successfully",
      account: data,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(" DELETE /api/accounts/[id] - Start")
  console.log(" Account ID:", params.id)
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    console.log(" Supabase client created with SERVICE_ROLE_KEY")

    const url = new URL(request.url)
    let user_id: string | null = url.searchParams.get("user_id")
    console.log(" User ID from query param:", user_id)

    if (!user_id) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7)
          const decoded = JSON.parse(atob(token))
          user_id = decoded.id
          console.log(" User ID from Authorization header:", user_id)
        } catch (e) {
          console.error(" Failed to decode auth token:", e)
        }
      }
    }

    // Fallback: try to get from cookie
    if (!user_id) {
      const userCookie = cookieStore.get("user")
      if (userCookie?.value) {
        try {
          const userData = JSON.parse(userCookie.value)
          user_id = userData.id
          console.log(" User ID from cookie:", user_id)
        } catch (e) {
          console.error(" Failed to parse user cookie:", e)
        }
      }
    }

    if (!user_id) {
      console.log(" No user ID found - unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has permission
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", user_id)
      .single()

    console.log(" User role:", user?.role)

    if (!user) {
      console.log(" User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRole = user.role?.toLowerCase() || ""
    const canManage = userRole === "admin" || userRole === "super_admin" || userRole === "admin_client"

    if (!canManage) {
      console.log(" User does not have permission to delete accounts")
      return NextResponse.json({ 
        error: "Forbidden - Only Admin users can delete accounts" 
      }, { status: 403 })
    }

    console.log(" Executing database delete...")
    const { error } = await supabase
      .from("github_tokens")
      .delete()
      .eq("id", params.id)

    console.log(" Delete completed, error:", error)

    if (error) {
      console.error(" Database error:", error)
      throw error
    }

    console.log(" Account deleted successfully")
    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error: any) {
    console.error(" Error deleting account:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(" PUT /api/accounts/[id] - Start")
  console.log(" Account ID:", params.id)
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    console.log(" Supabase client created with SERVICE_ROLE_KEY")

    const body = await request.json()
    console.log(" Request body:", { ...body, access_token: body.access_token ? "[REDACTED]" : undefined })

    const user_id = body.user_id || request.headers.get("x-user-id")
    console.log(" User ID from request:", user_id ? "Found" : "Not found")

    if (!user_id) {
      console.log(" No user ID provided")
      return NextResponse.json({ error: "Unauthorized - No user ID" }, { status: 401 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", user_id)
      .single()

    console.log(" User role:", user?.role)

    if (!user) {
      console.log(" User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRole = user.role?.toLowerCase() || ""
    const canManage = userRole === "admin" || userRole === "super_admin" || userRole === "admin_client"

    if (!canManage) {
      console.log(" User does not have permission to manage tokens")
      return NextResponse.json({ 
        error: "Forbidden - Only Admin users can manage tokens" 
      }, { status: 403 })
    }

    const { account_name, access_token } = body
    console.log(" Parsed fields - account_name:", !!account_name, "access_token:", !!access_token)

    const updateData: any = {}
    
    if (account_name !== undefined) {
      if (!account_name || account_name.trim() === "") {
        console.log(" Account name is required but empty")
        return NextResponse.json(
          { error: "Account name is required" },
          { status: 400 }
        )
      }
      updateData.account_name = account_name.trim()
      console.log(" Will update account_name")
    }

    if (access_token !== undefined && access_token.trim() !== "") {
      updateData.access_token = access_token.trim()
      console.log(" Will update access_token")
    }

    console.log(" Update fields:", Object.keys(updateData))
    console.log(" Executing database update...")

    const { data, error } = await supabase
      .from("github_tokens")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    console.log(" Database update completed")
    console.log(" Error:", error)
    console.log(" Data returned:", !!data)

    if (error) {
      console.error(" Database error:", error)
      throw error
    }

    if (!data) {
      console.log(" No data returned - account not found")
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    console.log(" Account updated successfully")
    return NextResponse.json({
      message: "Account updated successfully",
      account: data,
    })
  } catch (error: any) {
    console.error(" Error updating account:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
