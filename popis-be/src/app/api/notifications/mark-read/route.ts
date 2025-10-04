import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { notificationId } = body

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!notificationId) {
      return Response.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Verify notification belongs to user
    const notification = await payload.findByID({
      collection: 'notifications',
      id: notificationId,
    })

    if (!notification) {
      return Response.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (typeof notification.recipient !== 'string' && notification.recipient?.id !== user.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (typeof notification.recipient === 'string' && notification.recipient !== user.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Mark as read
    const updatedNotification = await payload.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        read: true,
      },
    })

    return Response.json({
      success: true,
      notification: updatedNotification,
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
