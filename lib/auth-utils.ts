import { cookies } from 'next/headers'

export async function getUserFromRequest(request?: Request): Promise<{ user: any; error: any }> {
  try {
    console.log(' getUserFromRequest - Start')
    
    // Try to get user from Authorization header
    if (request) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log(' Found Authorization header with token')
        
        // Decode JWT token (simple decode, not verification - that should be done separately)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log(' Decoded token payload:', { email: payload.email, role: payload.role })
          return { user: payload, error: null }
        } catch (e) {
          console.error(' Failed to decode token:', e)
        }
      }
    }
    
    // Try to get user from cookie
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value)
        console.log(' Found user in cookie:', { email: user.email, role: user.role })
        return { user, error: null }
      } catch (e) {
        console.error(' Failed to parse user cookie:', e)
      }
    }
    
    console.log(' No user found in request or cookie')
    return { user: null, error: { message: 'Unauthorized' } }
  } catch (error) {
    console.error(' Error in getUserFromRequest:', error)
    return { user: null, error }
  }
}
