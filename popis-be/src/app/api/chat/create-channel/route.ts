import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { StreamChat } from 'stream-chat'

export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { applicationId } = body
    
    // Get user from request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!applicationId) {
      return Response.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      )
    }
    
    // Get Stream credentials
    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET
    
    if (!apiKey || !apiSecret) {
      return Response.json(
        { success: false, error: 'Chat service not configured' },
        { status: 500 }
      )
    }
    
    // Get application
    const application = await payload.findByID({
      collection: 'applications',
      id: applicationId,
      depth: 2,
    })
    
    if (!application) {
      return Response.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check if application is accepted
    if (application.status !== 'accepted' && application.status !== 'completed') {
      return Response.json(
        { success: false, error: 'Application must be accepted first' },
        { status: 400 }
      )
    }
    
    // Get volunteer and organization
    const volunteer: any = application.volunteer
    const event: any = application.event
    const organization: any = event.organization
    
    // Initialize Stream
    const serverClient = StreamChat.getInstance(apiKey, apiSecret)
    
    // Generate Stream user IDs
    const volunteerStreamId = `user-${volunteer.id || volunteer}`
    const organizationStreamId = `user-${organization.id || organization}`
    
    // Create channel
    const channelId = `application-${application.id}`
    const channel = serverClient.channel('messaging', channelId, {
      name: `${event.title}`,
      members: [volunteerStreamId, organizationStreamId],
      created_by_id: user.streamUserId || `user-${user.id}`,
      application_id: application.id,
      event_id: event.id,
    })
    
    await channel.create()
    
    // Update application with channel ID
    await payload.update({
      collection: 'applications',
      id: applicationId,
      data: {
        chatChannelId: channelId,
      },
    })
    
    return Response.json({
      success: true,
      channelId,
      message: 'Chat channel created successfully',
    })
  } catch (error: any) {
    console.error('Error creating chat channel:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

