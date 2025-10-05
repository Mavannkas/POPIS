import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const payload = await getPayload({ config: configPromise })

  // Auth (either volunteer user or admin is fine)
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('applicationId')
  const since = searchParams.get('since')

  if (!applicationId) {
    return new Response('applicationId required', { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start: async controller => {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Initial send of recent messages
      try {
        const where: any = { application: { equals: applicationId } }
        if (since) {
          where.createdAt = { greater_than: since }
        }

        const { docs } = await payload.find({
          collection: 'messages',
          where,
          depth: 0,
          sort: 'createdAt',
          limit: 50,
        })
        send({ type: 'snapshot', messages: docs })
      } catch (e) {
        send({ type: 'error', message: 'Failed to load messages' })
      }

      // Polling every 2000ms for new messages
      let last = since || new Date().toISOString()
      const interval = setInterval(async () => {
        try {
          const { docs } = await payload.find({
            collection: 'messages',
            where: {
              application: { equals: applicationId },
              createdAt: { greater_than: last },
            },
            depth: 0,
            sort: 'createdAt',
            limit: 50,
          })
          if (docs.length > 0) {
            last = docs[docs.length - 1].createdAt
            send({ type: 'append', messages: docs })
          }
        } catch {}
      }, 2000)

      const close = () => {
        clearInterval(interval)
        controller.close()
      }

      // Close when client disconnects
      ;(request as any).signal?.addEventListener('abort', close)
    },
  })

  return new Response(stream as any, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}


