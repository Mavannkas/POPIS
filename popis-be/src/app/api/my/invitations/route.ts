import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

/**
 * GET endpoint for volunteers to see their invitations
 */
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
    
    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // pending, accepted, declined
    
    // Build where query
    const where: any = {
      volunteer: { equals: user.id },
    }
    
    if (status) {
      where.status = { equals: status }
    }
    
    const invitations = await payload.find({
      collection: 'invitations',
      where,
      depth: 2, // Include event and invitedBy details
      sort: '-invitedAt',
      limit: 100,
    })
    
    return Response.json({
      success: true,
      invitations: invitations.docs,
      totalDocs: invitations.totalDocs,
    })
  } catch (error: any) {
    console.error('Error fetching invitations:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

