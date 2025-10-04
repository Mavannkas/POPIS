import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

/**
 * GET endpoint for coordinators to see students from their school
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
    
    if (user.role !== 'coordinator' && user.role !== 'superadmin') {
      return Response.json(
        { success: false, error: 'Only coordinators can access this endpoint' },
        { status: 403 }
      )
    }
    
    // Get coordinator's school
    const coordinatorSchool = user.schoolName
    
    if (!coordinatorSchool) {
      return Response.json(
        { success: false, error: 'Coordinator must have a school assigned' },
        { status: 400 }
      )
    }
    
    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') // search by name or email
    
    // Find the school in Schools collection by name
    const schools = await payload.find({
      collection: 'schools',
      where: {
        name: { equals: coordinatorSchool },
      },
      limit: 1,
    })
    
    if (schools.docs.length === 0) {
      return Response.json({
        success: true,
        students: [],
        totalDocs: 0,
        message: 'No school found with that name. Students may not have registered yet.',
      })
    }
    
    const schoolId = schools.docs[0].id
    
    // Build where query
    const where: any = {
      and: [
        { isStudent: { equals: true } },
        { school: { equals: schoolId } },
      ],
    }
    
    if (search) {
      where.or = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ]
    }
    
    const students = await payload.find({
      collection: 'users',
      where,
      depth: 1, // Include school details
      sort: 'lastName',
      limit: 100,
    })
    
    return Response.json({
      success: true,
      students: students.docs,
      totalDocs: students.totalDocs,
      school: schools.docs[0],
    })
  } catch (error: any) {
    console.error('Error fetching students:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

