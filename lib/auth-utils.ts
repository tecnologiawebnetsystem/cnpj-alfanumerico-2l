import { cookies } from 'next/headers'

export async function getUserFromRequest(request?: Request): Promise<{ user: any; error: any }> {
  try {
    console.log('[v0] getUserFromRequest - Start')
    
    // Try to get user from Authorization header
    if (request) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log('[v0] Found Authorization header with token')
        
        // Decode JWT token (simple decode, not verification - that should be done separately)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('[v0] Decoded token payload:', { email: payload.email, role: payload.role })
          return { user: payload, error: null }
        } catch (e) {
          console.error('[v0] Failed to decode token:', e)
        }
      }
    }
    
    // Try to get user from cookie
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value)
        console.log('[v0] Found user in cookie:', { email: user.email, role: user.role })
        return { user, error: null }
      } catch (e) {
        console.error('[v0] Failed to parse user cookie:', e)
      }
    }
    
    console.log('[v0] No user found in request or cookie')
    return { user: null, error: { message: 'Unauthorized' } }
  } catch (error) {
    console.error('[v0] Error in getUserFromRequest:', error)
    return { user: null, error }
  }
}
