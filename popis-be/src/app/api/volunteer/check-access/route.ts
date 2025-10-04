import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

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
    
    // Check if user has admin access (only organization, coordinator, superadmin)
    if (!['organization', 'coordinator', 'superadmin'].includes(user.role)) {
      return Response.json({
        success: false,
        error: 'Access denied to admin panel',
        message: 'Only organizations, coordinators and superadmins have access to admin panel',
        role: user.role,
        redirectTo: 'mobile-app'
      })
    }
    
    // Other roles can access admin panel
    return Response.json({
      success: true,
      message: 'Access granted to admin panel',
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
