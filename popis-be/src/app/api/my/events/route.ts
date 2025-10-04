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
    
    if (user.role !== 'organization') {
      return Response.json(
        { success: false, error: 'Only organizations can access this endpoint' },
        { status: 403 }
      )
    }
    
    const events = await payload.find({
      collection: 'events',
      where: {
        organization: { equals: user.id },
      },
      depth: 2,
      sort: '-createdAt',
    })
    
    return Response.json({
      success: true,
      events: events.docs,
      totalDocs: events.totalDocs,
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

