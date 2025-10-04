import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { eventId, message } = body
    
    // Get user from request (Payload auth)
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (user.role !== 'volunteer') {
      return Response.json(
        { success: false, error: 'Only volunteers can apply to events' },
        { status: 403 }
      )
    }
    
    if (!eventId) {
      return Response.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    // Check if event exists and is published
    const event = await payload.findByID({
      collection: 'events',
      id: eventId,
    })
    
    if (!event) {
      return Response.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }
    
    if (event.status !== 'published') {
      return Response.json(
        { success: false, error: 'Event is not published' },
        { status: 400 }
      )
    }
    
    // Check if user already applied
    const existingApplication = await payload.find({
      collection: 'applications',
      where: {
        and: [
          { event: { equals: eventId } },
          { volunteer: { equals: user.id } },
        ],
      },
    })
    
    if (existingApplication.docs.length > 0) {
      return Response.json(
        { success: false, error: 'You have already applied to this event' },
        { status: 400 }
      )
    }
    
    // Check age requirement
    const userAge = user.isMinor ? 17 : 18 // Simplified
    if (event.minAge && userAge < event.minAge) {
      return Response.json(
        { success: false, error: 'You do not meet the age requirement' },
        { status: 400 }
      )
    }
    
    // Create application
    const application = await payload.create({
      collection: 'applications',
      data: {
        event: eventId,
        volunteer: user.id,
        message: message || '',
        status: 'pending',
      },
    })
    
    return Response.json({
      success: true,
      application,
    })
  } catch (error: any) {
    console.error('Error applying to event:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

