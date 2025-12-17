import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[v0] Validating Git token availability...')
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ hasToken: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('client_id')
      .eq('id', user.id)
      .single()

    if (!userData?.client_id) {
      console.log('[v0] User has no client_id')
      return NextResponse.json({ hasToken: false })
    }

    // Check if client has GitHub or Azure DevOps token
    const { data: accounts } = await supabase
      .from('github_tokens')
      .select('provider, pat_token')
      .eq('client_id', userData.client_id)
      .in('provider', ['github', 'azure_devops'])

    console.log('[v0] Found accounts:', accounts?.length || 0)

    const hasToken = accounts && accounts.length > 0 && accounts.some(acc => acc.pat_token && acc.pat_token.length > 0)

    console.log('[v0] Has valid Git token:', hasToken)

    return NextResponse.json({ 
      hasToken: !!hasToken,
      provider: hasToken ? accounts[0].provider : null
    })
  } catch (error) {
    console.error('[v0] Error validating Git token:', error)
    return NextResponse.json({ hasToken: false, error: 'Internal error' }, { status: 500 })
  }
}
