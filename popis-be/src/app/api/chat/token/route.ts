import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
// Stream Chat removed

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Get user from request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return Response.json({ success: true, message: 'Stream chat disabled' })
  } catch (error: any) {
    console.error('Error generating Stream token:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

