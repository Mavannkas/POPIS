import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

/**
 * API endpoint for coordinators/organizations to invite volunteers to events
 * Supports bulk invitations (multiple volunteers at once)
 */
export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    
    // Get user from request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!['organization', 'coordinator', 'superadmin'].includes(user.role)) {
      return Response.json(
        { success: false, error: 'Only organizations and coordinators can invite volunteers' },
        { status: 403 }
      )
    }
    
    const { eventId, volunteerIds, message } = body
    
    if (!eventId || !volunteerIds || !Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return Response.json(
        { success: false, error: 'eventId and volunteerIds (array) are required' },
        { status: 400 }
      )
    }
    
    // Verify event exists
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
    
    // Check if coordinator - verify volunteers are from their school
    if (user.role === 'coordinator') {
      // Get coordinator's school
      const coordinatorSchool = user.schoolName
      
      if (!coordinatorSchool) {
        return Response.json(
          { success: false, error: 'Coordinator must have a school assigned' },
          { status: 400 }
        )
      }
      
      // Verify all volunteers are students from the same school
      for (const volunteerId of volunteerIds) {
        const volunteer = await payload.findByID({
          collection: 'users',
          id: volunteerId,
          depth: 1,
        })
        
        if (!volunteer) {
          return Response.json(
            { success: false, error: `Volunteer ${volunteerId} not found` },
            { status: 404 }
          )
        }
        
        if (!volunteer.isStudent) {
          return Response.json(
            { success: false, error: `Volunteer ${volunteer.email} is not a student` },
            { status: 400 }
          )
        }
        
        // Get school details
        const volunteerSchool = typeof volunteer.school === 'object' ? volunteer.school : null
        
        if (!volunteerSchool || volunteerSchool.name !== coordinatorSchool) {
          return Response.json(
            { 
              success: false, 
              error: `Coordinator can only invite students from their school (${coordinatorSchool})` 
            },
            { status: 403 }
          )
        }
      }
    }
    
    // Create invitations
    const createdInvitations = []
    const errors = []
    
    for (const volunteerId of volunteerIds) {
      try {
        const invitation = await payload.create({
          collection: 'invitations',
          data: {
            event: eventId,
            volunteer: volunteerId,
            invitedBy: user.id,
            message: message || '',
            status: 'pending',
          },
        })
        createdInvitations.push(invitation)
      } catch (error: any) {
        errors.push({
          volunteerId,
          error: error.message,
        })
      }
    }
    
    return Response.json({
      success: true,
      invitations: createdInvitations,
      errors: errors.length > 0 ? errors : undefined,
      message: `${createdInvitations.length} invitation(s) created${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    })
  } catch (error: any) {
    console.error('Error creating invitations:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

