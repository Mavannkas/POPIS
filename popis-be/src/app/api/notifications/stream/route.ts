import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import NotificationService from '@/services/NotificationService'

export const GET = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Set up SSE headers
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({ type: 'connected', message: 'Połączono z serwerem powiadomień' })}\n\n`
        controller.enqueue(encoder.encode(initialMessage))

        // Create a custom response object that works with our NotificationService
        const mockResponse: any = {
          write: (data: string) => {
            controller.enqueue(encoder.encode(data))
          },
          on: (event: string, callback: () => void) => {
            if (event === 'close') {
              // Store the close callback
              mockResponse._closeCallback = callback
            }
          },
          _closeCallback: null,
        }

        // Add connection to notification service
        NotificationService.addConnection(user.id, mockResponse)

        // Handle stream cancellation (client disconnect)
        const cleanup = () => {
          if (mockResponse._closeCallback) {
            mockResponse._closeCallback()
          }
          controller.close()
        }

        // Store cleanup function for later use
        mockResponse._cleanup = cleanup
      },
      cancel() {
        // This is called when the client disconnects
        console.log(`[SSE] Client ${user.id} disconnected`)
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for nginx
      },
    })
  } catch (error: any) {
    console.error('[SSE] Error setting up stream:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
