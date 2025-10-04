import { StreamChat } from 'stream-chat'

let streamClient: StreamChat | null = null

export const getStreamClient = () => {
  if (streamClient) {
    return streamClient
  }
  
  const apiKey = process.env.STREAM_API_KEY
  const apiSecret = process.env.STREAM_API_SECRET
  
  if (!apiKey || !apiSecret) {
    throw new Error('Stream Chat credentials not configured')
  }
  
  streamClient = StreamChat.getInstance(apiKey, apiSecret)
  return streamClient
}

export const createChatChannel = async (
  volunteerId: string,
  organizationId: string,
  applicationId: string,
  eventTitle: string
) => {
  try {
    const client = getStreamClient()
    
    const volunteerStreamId = `user-${volunteerId}`
    const organizationStreamId = `user-${organizationId}`
    const channelId = `application-${applicationId}`
    
    // Create channel
    const channel = client.channel('messaging', channelId, {
      name: eventTitle,
      members: [volunteerStreamId, organizationStreamId],
      application_id: applicationId,
    })
    
    await channel.create()
    
    return channelId
  } catch (error) {
    console.error('Error creating chat channel:', error)
    throw error
  }
}

export const generateStreamToken = async (userId: string, userName: string, userEmail: string, role: string) => {
  try {
    const client = getStreamClient()
    const streamUserId = `user-${userId}`
    
    // Upsert user in Stream
    await client.upsertUser({
      id: streamUserId,
      name: userName,
      role,
      email: userEmail,
    })
    
    // Generate token
    const token = client.createToken(streamUserId)
    
    return { token, streamUserId }
  } catch (error) {
    console.error('Error generating Stream token:', error)
    throw error
  }
}

