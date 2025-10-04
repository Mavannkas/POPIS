import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params
    const body = await request.json()
    const { hoursWorked, notes } = body
    
    // Get user from request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!['organization', 'coordinator', 'superadmin'].includes(user.role)) {
      return Response.json(
        { success: false, error: 'Only organizations and coordinators can complete applications' },
        { status: 403 }
      )
    }
    
    if (!hoursWorked || hoursWorked <= 0) {
      return Response.json(
        { success: false, error: 'Hours worked must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Get application
    const application = await payload.findByID({
      collection: 'applications',
      id,
      depth: 2,
    })
    
    if (!application) {
      return Response.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check if user owns the event (unless superadmin)
    if (user.role !== 'superadmin') {
      const event: any = application.event
      if (event.organization !== user.id && event.organization?.id !== user.id) {
        return Response.json(
          { success: false, error: 'You can only complete applications to your own events' },
          { status: 403 }
        )
      }
    }
    
    // Update application
    const updatedApplication = await payload.update({
      collection: 'applications',
      id,
      data: {
        status: 'completed',
        hoursWorked,
        organizationNotes: notes,
        completedAt: new Date().toISOString(),
      },
    })
    
    return Response.json({
      success: true,
      application: updatedApplication,
      message: 'Application completed. Certificate will be auto-generated.',
    })
  } catch (error: any) {
    console.error('Error completing application:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

