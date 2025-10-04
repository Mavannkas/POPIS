import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get unread notifications
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        and: [
          { recipient: { equals: user.id } },
          { read: { equals: false } },
        ],
      },
      sort: '-createdAt',
      limit: 50,
    })

    return Response.json({
      success: true,
      notifications: notifications.docs,
      total: notifications.totalDocs,
    })
  } catch (error: any) {
    console.error('Error fetching unread notifications:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
