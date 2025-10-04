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

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Get all notifications for user
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        recipient: { equals: user.id },
      },
      sort: '-createdAt',
      limit,
      page,
    })

    return Response.json({
      success: true,
      notifications: notifications.docs,
      total: notifications.totalDocs,
      page: notifications.page,
      totalPages: notifications.totalPages,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
