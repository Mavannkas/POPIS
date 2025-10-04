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
    
    let where: any = {}
    
    if (user.role === 'volunteer') {
      where = { volunteer: { equals: user.id } }
    } else if (user.role === 'organization') {
      where = { organization: { equals: user.id } }
    } else if (user.role === 'coordinator') {
      // Coordinators can see all certificates (simplified for hackathon)
      where = {}
    } else if (user.role !== 'superadmin') {
      return Response.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }
    
    const certificates = await payload.find({
      collection: 'certificates',
      where,
      depth: 3,
      sort: '-issueDate',
    })
    
    return Response.json({
      success: true,
      certificates: certificates.docs,
      totalDocs: certificates.totalDocs,
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

