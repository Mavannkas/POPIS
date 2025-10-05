import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
// Stream Chat removed

export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { applicationId } = body
    
    // Get user from request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!applicationId) {
      return Response.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      )
    }
    
    // Get application
    const application = await payload.findByID({
      collection: 'applications',
      id: applicationId,
      depth: 2,
    })
    
    if (!application) {
      return Response.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check if application is accepted
    if (application.status !== 'accepted' && application.status !== 'completed') {
      return Response.json(
        { success: false, error: 'Application must be accepted first' },
        { status: 400 }
      )
    }
    
    // Get volunteer and organization
    const volunteer: any = application.volunteer
    const event: any = application.event
    const organization: any = event.organization
    
    return Response.json({ success: false, error: 'Stream chat disabled' }, { status: 400 })
  } catch (error: any) {
    console.error('Error creating chat channel:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

