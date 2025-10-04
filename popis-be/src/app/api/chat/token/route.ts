import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { StreamChat } from 'stream-chat'

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
    
    // Get Stream credentials from env
    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET
    
    if (!apiKey || !apiSecret) {
      console.error('Stream Chat credentials not configured')
      return Response.json(
        { success: false, error: 'Chat service not configured' },
        { status: 500 }
      )
    }
    
    // Initialize Stream Chat
    const serverClient = StreamChat.getInstance(apiKey, apiSecret)
    
    // Generate user ID for Stream (use Payload user ID)
    const streamUserId = `user-${user.id}`
    
    // Create or update user in Stream
    await serverClient.upsertUser({
      id: streamUserId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      role: user.role,
      email: user.email,
    })
    
    // Generate token
    const token = serverClient.createToken(streamUserId)
    
    // Update user's streamUserId in Payload (if not set)
    if (!user.streamUserId) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          streamUserId,
        },
      })
    }
    
    return Response.json({
      success: true,
      token,
      apiKey,
      userId: streamUserId,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    })
  } catch (error: any) {
    console.error('Error generating Stream token:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

