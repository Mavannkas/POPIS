import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

/**
 * POST endpoint for volunteers to respond to invitations (accept/decline)
 */
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params
    const body = await request.json()
    
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
        { success: false, error: 'Only volunteers can respond to invitations' },
        { status: 403 }
      )
    }
    
    const { action } = body
    
    if (!action || !['accept', 'decline'].includes(action)) {
      return Response.json(
        { success: false, error: 'action must be "accept" or "decline"' },
        { status: 400 }
      )
    }
    
    // Get invitation
    const invitation = await payload.findByID({
      collection: 'invitations',
      id,
      depth: 2,
    })
    
    if (!invitation) {
      return Response.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }
    
    // Verify user owns this invitation
    const volunteerId = typeof invitation.volunteer === 'object' ? invitation.volunteer.id : invitation.volunteer
    if (volunteerId !== user.id) {
      return Response.json(
        { success: false, error: 'You can only respond to your own invitations' },
        { status: 403 }
      )
    }
    
    // Check if already responded
    if (invitation.status !== 'pending') {
      return Response.json(
        { success: false, error: `Invitation already ${invitation.status}` },
        { status: 400 }
      )
    }
    
    // Update invitation status
    const newStatus = action === 'accept' ? 'accepted' : 'declined'
    const updatedInvitation = await payload.update({
      collection: 'invitations',
      id,
      data: {
        status: newStatus,
      },
    })
    
    // Mark related notifications as handled (best-effort; hooks also cover this)
    try {
      const relatedNotifs = await payload.find({
        collection: 'notifications',
        where: { invitation: { equals: id } },
        limit: 50,
      })
      for (const n of relatedNotifs.docs) {
        await payload.update({
          collection: 'notifications',
          id: n.id,
          data: { isRead: true, actionRequired: false },
        })
      }
    } catch (e) {
      console.error('Failed to update related notifications for invitation:', e)
    }

    // The afterChange hook may auto-create application if accepted
    
    return Response.json({
      success: true,
      invitation: updatedInvitation,
      message: action === 'accept' 
        ? 'Invitation accepted! Application created automatically.' 
        : 'Invitation declined.',
    })
  } catch (error: any) {
    console.error('Error responding to invitation:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

