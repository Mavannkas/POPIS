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
    
    if (user.role !== 'volunteer') {
      return Response.json(
        { success: false, error: 'Only volunteers can access this endpoint' },
        { status: 403 }
      )
    }
    
    const applications = await payload.find({
      collection: 'applications',
      where: {
        volunteer: { equals: user.id },
      },
      depth: 2,
      sort: '-appliedAt',
    })
    
    return Response.json({
      success: true,
      applications: applications.docs,
      totalDocs: applications.totalDocs,
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

