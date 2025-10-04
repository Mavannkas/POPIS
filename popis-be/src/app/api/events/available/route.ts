import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const searchParams = request.nextUrl.searchParams
    
    // Get filters from query params
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const minAge = searchParams.get('minAge')
    const search = searchParams.get('search')
    
    // Build where query
    const where: any = {
      status: { equals: 'published' },
    }
    
    if (category) {
      where.category = { equals: category }
    }
    
    if (city) {
      where['location.city'] = { contains: city }
    }
    
    if (minAge) {
      where.minAge = { less_than_or_equal: parseInt(minAge) }
    }
    
    if (search) {
      where.or = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }
    
    const events = await payload.find({
      collection: 'events',
      where,
      limit: 100,
      sort: '-startDate',
      depth: 2,
    })
    
    return Response.json({
      success: true,
      events: events.docs,
      totalDocs: events.totalDocs,
      page: events.page,
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

