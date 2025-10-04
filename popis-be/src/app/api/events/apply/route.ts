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
    
    // Volunteers live in 'users' collection (no explicit role)
    if (user.collection !== 'users') {
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

    // Require application message (why the user should be selected)
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Application message is required' },
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
    
    // Check age requirement (simple flags computed on user)
    const userAge = user.isMinor ? 17 : 18
    if (event.minAge && userAge < event.minAge) {
      return Response.json(
        { success: false, error: 'You do not meet the age requirement' },
        { status: 400 }
      )
    }

    // If event is school-type ensure student belongs to target school (if set)
    if (event.eventType === 'school' && event.targetSchool) {
      if (!user.isStudent || !user.school) {
        return Response.json(
          { success: false, error: 'Only students of the target school can apply' },
          { status: 403 }
        )
      }
      const targetId = typeof event.targetSchool === 'object' ? event.targetSchool.id : event.targetSchool
      const userSchoolId = typeof user.school === 'object' ? user.school.id : user.school
      if (String(targetId) !== String(userSchoolId)) {
        return Response.json(
          { success: false, error: 'This school event is restricted to your school' },
          { status: 403 }
        )
      }
    }
    
    // Create application
    const application = await payload.create({
      collection: 'applications',
      data: {
        event: eventId,
        volunteer: user.id,
        message: message.trim(),
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

