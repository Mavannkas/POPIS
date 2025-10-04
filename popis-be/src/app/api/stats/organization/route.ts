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
    
    if (user.role !== 'organization' && user.role !== 'superadmin') {
      return Response.json(
        { success: false, error: 'Only organizations can access stats' },
        { status: 403 }
      )
    }
    
    // Get organization's events
    const events = await payload.find({
      collection: 'events',
      where: {
        organization: { equals: user.id },
      },
      limit: 1000,
    })
    
    // Get all applications for these events
    const eventIds = events.docs.map((e) => e.id)
    
    const applications = await payload.find({
      collection: 'applications',
      where: {
        event: { in: eventIds },
      },
      limit: 10000,
    })
    
    // Calculate stats
    const totalEvents = events.totalDocs
    const totalApplications = applications.totalDocs
    const acceptedApplications = applications.docs.filter((a) => a.status === 'accepted').length
    const completedApplications = applications.docs.filter((a) => a.status === 'completed').length
    const pendingApplications = applications.docs.filter((a) => a.status === 'pending').length
    
    // Calculate total hours
    const totalHours = applications.docs
      .filter((a) => a.status === 'completed' && a.hoursWorked)
      .reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
    
    // Unique volunteers
    const uniqueVolunteers = new Set(
      applications.docs.map((a) => {
        if (typeof a.volunteer === 'object' && a.volunteer !== null) {
          return a.volunteer.id
        }
        return a.volunteer
      })
    ).size
    
    return Response.json({
      success: true,
      stats: {
        totalEvents,
        publishedEvents: events.docs.filter((e) => e.status === 'published').length,
        draftEvents: events.docs.filter((e) => e.status === 'draft').length,
        completedEvents: events.docs.filter((e) => e.status === 'completed').length,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        completedApplications,
        uniqueVolunteers,
        totalHoursVolunteered: totalHours,
      },
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

