import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import NotificationService from '@/services/NotificationService'

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params
    
    // Get user from request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!['organization', 'coordinator', 'superadmin'].includes((user as any).role)) {
      return Response.json(
        { success: false, error: 'Only organizations and coordinators can reject applications' },
        { status: 403 }
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
    if ((user as any).role !== 'superadmin') {
      const event: any = application.event
      if (event.organization !== user.id && event.organization?.id !== user.id) {
        return Response.json(
          { success: false, error: 'You can only reject applications to your own events' },
          { status: 403 }
        )
      }
    }
    
    // Update application status
    const updatedApplication = await payload.update({
      collection: 'applications',
      id,
      data: {
        status: 'rejected',
      },
    })

    // Send notification to the volunteer about rejection
    try {
      const event: any = application.event
      const volunteerId = typeof application.volunteer === 'object' ? application.volunteer.id : application.volunteer

      const notification = await payload.create({
        collection: 'notifications',
        data: {
          type: 'join_request_rejected',
          recipient: volunteerId,
          event: event.id,
          message: `Twoje zgłoszenie do wydarzenia "${event.title}" zostało odrzucone.`,
          read: false,
          metadata: {
            applicationId: id,
            rejectedBy: user.id,
          },
        },
      })

      // Send real-time notification
      NotificationService.sendNotification(volunteerId, {
        id: notification.id,
        type: 'join_request_rejected',
        event: event,
        message: notification.message,
        read: false,
        createdAt: notification.createdAt,
      })
    } catch (notificationError: any) {
      console.error('Failed to send rejection notification:', notificationError)
      // Don't fail the rejection if notification fails
    }
    
    return Response.json({
      success: true,
      application: updatedApplication,
    })
  } catch (error: any) {
    console.error('Error rejecting application:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}