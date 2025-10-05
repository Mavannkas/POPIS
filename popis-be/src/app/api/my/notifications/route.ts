import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Volunteers live in the 'users' collection
    if (user.collection !== 'users') {
      return Response.json(
        { success: false, error: 'Only volunteers can access this endpoint' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const unread = searchParams.get('unread')

    const where: any = {
      user: { equals: user.id },
    }
    if (unread === 'true') {
      where.isRead = { equals: false }
    }

    const notifications = await payload.find({
      collection: 'notifications',
      where,
      depth: 2,
      sort: '-createdAt',
      limit: 100,
    })

    return Response.json({
      success: true,
      notifications: notifications.docs,
      totalDocs: notifications.totalDocs,
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


