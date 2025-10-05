import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.collection !== 'users') {
      return Response.json(
        { success: false, error: 'Only volunteers can access this endpoint' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { isRead, actionRequired } = body || {}

    // Fetch the notification to verify ownership
    const notification = await payload.findByID({
      collection: 'notifications',
      id,
    })

    if (!notification) {
      return Response.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    const ownerId = typeof notification.user === 'object' ? notification.user.id : notification.user
    if (String(ownerId) !== String(user.id)) {
      return Response.json(
        { success: false, error: 'You can only update your own notifications' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (typeof isRead === 'boolean') updateData.isRead = isRead
    if (typeof actionRequired === 'boolean') updateData.actionRequired = actionRequired

    const updated = await payload.update({
      collection: 'notifications',
      id,
      data: updateData,
    })

    return Response.json({ success: true, notification: updated })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


