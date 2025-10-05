import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!['coordinator', 'superadmin'].includes(user.role)) {
      return Response.json(
        { success: false, error: 'Only coordinators can create group applications' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('GroupApplications.create:request', { userId: user?.id, body })
    const { targetEventId, sourceSchoolEventId, message } = body as {
      targetEventId?: string
      sourceSchoolEventId?: string
      message?: string
    }

    if (!targetEventId || !sourceSchoolEventId) {
      return Response.json({ success: false, error: 'targetEventId and sourceSchoolEventId are required' }, { status: 400 })
    }

    // Validate event exists and is published
    const targetEvent = await payload.findByID({ collection: 'events', id: targetEventId })
    if (!targetEvent) {
      return Response.json({ success: false, error: 'Event not found' }, { status: 404 })
    }

    if (targetEvent.status !== 'published') {
      return Response.json({ success: false, error: 'Event is not published' }, { status: 400 })
    }
    // Validate source school event
    const sourceEvent = await payload.findByID({ collection: 'events', id: sourceSchoolEventId })
    if (!sourceEvent) {
      return Response.json({ success: false, error: 'Source school event not found' }, { status: 404 })
    }
    if (sourceEvent.eventType !== 'school') {
      return Response.json({ success: false, error: 'Source event must be of type school' }, { status: 400 })
    }
    if (sourceEvent.targetSchool) {
      const targetId = typeof sourceEvent.targetSchool === 'object' ? sourceEvent.targetSchool.id : sourceEvent.targetSchool
      const coordinatorSchool = user.schoolName
      if (!coordinatorSchool || String(coordinatorSchool) !== String(targetId)) {
        return Response.json(
          { success: false, error: 'Coordinator can only submit groups from their own school' },
          { status: 403 }
        )
      }
    }
    const participants = Array.isArray((sourceEvent as any).participants) ? (sourceEvent as any).participants : []
    const eligible = participants.filter((p: any) => !!p?.user && p.isAccepted !== false)
    console.log('GroupApplications.create:derived', {
      targetEventId: targetEvent.id,
      sourceEventId: sourceEvent.id,
      participants: participants.length,
      eligible: eligible.length,
    })
    // Allow creating even with zero eligible participants; acceptance will no-op later

    // Create group application
    const groupApplication = await payload.create({
      collection: 'group_applications',
      data: {
        targetEvent: targetEvent.id,
        coordinator: user.id,
        message: message ?? '',
        status: 'pending',
        sourceSchoolEvent: sourceEvent.id,
        studentsCount: eligible.length,
      },
    })
    console.log('GroupApplications.create:created', { id: (groupApplication as any)?.id })

    return Response.json({ success: true, groupApplication })
  } catch (error: any) {
    console.error('GroupApplications.create:error', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}


