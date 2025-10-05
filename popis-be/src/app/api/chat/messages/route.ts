import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('applicationId')
  if (!applicationId) return Response.json({ success: false, error: 'applicationId required' }, { status: 400 })
  const { docs } = await payload.find({ collection: 'messages', where: { application: { equals: applicationId } }, sort: 'createdAt', depth: 0, limit: 200 })
  return Response.json({ success: true, messages: docs })
}

export const POST = async (request: NextRequest) => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { applicationId, content, toAdmin } = body || {}
  if (!applicationId || typeof content !== 'string' || !content.trim()) {
    return Response.json({ success: false, error: 'applicationId and content are required' }, { status: 400 })
  }

  // Determine receiver: if sender is volunteer (users collection), send to event organization admin
  // If sender is admin, send to volunteer user
  const application = await payload.findByID({ collection: 'applications', id: String(applicationId), depth: 1 })
  if (!application) return Response.json({ success: false, error: 'Application not found' }, { status: 404 })

  const coerceId = (v: any) => {
    const s = String(v)
    return /^[0-9]+$/.test(s) ? Number(s) : s
  }
  const isVolunteer = (user as any).collection === 'users'
  const volunteerIdRaw = typeof application.volunteer === 'object' ? (application.volunteer as any).id : application.volunteer
  const event = application.event as any
  const organizationIdRaw = typeof event.organization === 'object' ? event.organization.id : event.organization
  const volunteerId = coerceId(volunteerIdRaw)
  const organizationId = coerceId(organizationIdRaw)

  const sender = isVolunteer ? { relationTo: 'users', value: coerceId((user as any).id) } : { relationTo: 'admins', value: coerceId((user as any).id) }
  const receiver = isVolunteer ? { relationTo: 'admins', value: organizationId } : { relationTo: 'users', value: volunteerId }

  const created = await payload.create({
    collection: 'messages',
    data: {
      application: coerceId(applicationId),
      sender,
      receiver,
      content: content.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    },
  })

  return Response.json({ success: true, message: created })
}


