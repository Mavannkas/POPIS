import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const searchParams = request.nextUrl.searchParams
    
    // Get user from request (optional - for filtering by student status)
    const { user } = await payload.auth({ headers: request.headers })
    
    // Get filters from query params
    // Support multi-select via repeated params and comma-separated values
    const categoryParams = searchParams.getAll('category')
    const category = categoryParams.length > 0 ? categoryParams : (searchParams.get('category')?.split(',').filter(Boolean) || [])
    const city = searchParams.get('city')
    const minAge = searchParams.get('minAge')
    const sizeParams = searchParams.getAll('size')
    const size = sizeParams.length > 0 ? sizeParams : (searchParams.get('size')?.split(',').filter(Boolean) || [])
    const search = searchParams.get('search')
    const eventType = searchParams.get('eventType') // 'public' or 'school'
    const limitParam = searchParams.get('limit')
    const applied = searchParams.get('applied') // 'applied' | 'not_applied'
    const limit = limitParam ? parseInt(limitParam) : undefined
    
    // Build where query
    const where: any = {
      status: { equals: 'published' },
    }
    
    // Filter by event type
    if (eventType) {
      where.eventType = { equals: eventType }
      // If user is a student and explicitly filters for school events,
      // require events to be from the student's own school
      if (
        eventType === 'school' &&
        user &&
        user.role === 'volunteer' &&
        user.isStudent &&
        user.school
      ) {
        where.targetSchool = { equals: user.school }
      }
    } else if (user && user.role === 'volunteer') {
      // Auto-filter based on student status if not explicitly specified
      if (!user.isStudent) {
        // Non-students can only see public events
        where.eventType = { equals: 'public' }
      } else {
        // Students see public events + school events for their school
        where.or = [
          { eventType: { equals: 'public' } },
          {
            and: [
              { eventType: { equals: 'school' } },
              {
                or: [
                  { targetSchool: { exists: false } },
                  { targetSchool: { equals: null } },
                  { targetSchool: { equals: user.school } },
                ],
              },
            ],
          },
        ]
      }
    } else {
      // Public (not logged in) can only see public events
      where.eventType = { equals: 'public' }
    }
    
    if (category && category.length > 0) {
      if (category.length === 1) {
        where.category = { equals: category[0] }
      } else {
        where.category = { in: category }
      }
    }
    
    if (city) {
      where['location.city'] = { contains: city }
    }
    
    if (minAge) {
      where.minAge = { less_than_or_equal: parseInt(minAge) }
    }
    
    if (size && size.length > 0) {
      if (size.length === 1) {
        where.size = { equals: size[0] }
      } else {
        where.size = { in: size }
      }
    }
    
    if (search) {
      // If there's already an 'or' clause, we need to combine them
      const searchConditions = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
      
      if (where.or) {
        // Combine existing or with search or using and
        where.and = [
          { or: where.or },
          { or: searchConditions },
        ]
        delete where.or
      } else {
        where.or = searchConditions
      }
    }
    
    const events = await payload.find({
      collection: 'events',
      where: {
        and: [
          where,
          { startDate: { greater_than_or_equal: new Date().toISOString() } },
        ],
      },
      limit: 100,
      sort: 'startDate',
      depth: 2,
    })

    // Filter by available spots and attach acceptedCount to each event
    const filteredDocs: any[] = []
    for (const ev of events.docs as any[]) {
      // Age restriction: NEVER show events above user's age
      if (user) {
        const userAge = user.isMinor ? 17 : 18
        if (typeof ev.minAge === 'number' && userAge < ev.minAge) {
          continue
        }
      }
      // If not logged in, keep as-is (public listing); backend already enforces published + public
      let acceptedCount = 0
      let hasMyApplication: boolean | null = null
      try {
        const apps = await payload.find({
          collection: 'applications',
          where: {
            and: [
              { event: { equals: ev.id } },
              { status: { equals: 'accepted' } },
            ],
          },
          limit: 1, // we only need totalDocs
        })
        acceptedCount = apps.totalDocs || 0
      } catch (e) {
        // ignore; keep 0
      }

      // If user is logged in, determine whether they applied
      if (user) {
        try {
          const myApps = await payload.find({
            collection: 'applications',
            where: {
              and: [
                { event: { equals: ev.id } },
                { volunteer: { equals: user.id } },
              ],
            },
            limit: 1,
          })
          hasMyApplication = (myApps.totalDocs || 0) > 0
        } catch (e) {
          hasMyApplication = null
        }
      }

      // include event if has capacity or no limit
      // Capacity filter
      if (!ev.maxVolunteers || acceptedCount < (ev.maxVolunteers as number)) {
        // Apply applied/not_applied filter if provided
        if (applied && user) {
          if (applied === 'applied' && hasMyApplication !== true) continue
          if (applied === 'not_applied' && hasMyApplication === true) continue
        }
        filteredDocs.push({ ...ev, acceptedCount })
      }
      if (limit && filteredDocs.length >= limit) break
    }

    return Response.json({
      success: true,
      events: filteredDocs,
      totalDocs: filteredDocs.length,
      page: 1,
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

