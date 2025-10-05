import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    const { id } = await params
    console.log('GroupApplications.accept:start', { id, userId: user?.id })

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!['organization', 'superadmin'].includes(user.role)) {
      return Response.json(
        { success: false, error: 'Only organizations can accept group applications' },
        { status: 403 }
      )
    }

    const group = await payload.findByID({ collection: 'group_applications', id, depth: 2 })
    if (!group) {
      return Response.json({ success: false, error: 'Group application not found' }, { status: 404 })
    }

    // Verify ownership: targetEvent.organization must be current org (unless superadmin)
    if (user.role !== 'superadmin') {
      const event: any = group.targetEvent
      const orgId = typeof event.organization === 'object' ? event.organization.id : event.organization
      if (String(orgId) !== String(user.id)) {
        return Response.json(
          { success: false, error: 'You can only accept for your own events' },
          { status: 403 }
        )
      }
    }

    // If already processed
    if (group.status !== 'pending') {
      return Response.json({ success: false, error: 'Group application already processed' }, { status: 400 })
    }

    // Create individual applications with status=accepted for each student
    const eventId = typeof group.targetEvent === 'object' ? group.targetEvent.id : group.targetEvent
    const source: any = typeof group.sourceSchoolEvent === 'object' ? group.sourceSchoolEvent : await payload.findByID({ collection: 'events', id: group.sourceSchoolEvent as any })
    const participants = Array.isArray(source.participants) ? source.participants : []
    console.log('GroupApplications.accept:source', { eventId, sourceEventId: source?.id, participants: participants.length })

    let created = 0
    let skipped = 0
    for (const p of participants) {
      if (p.isAccepted === false) continue
      const studentId = typeof p.user === 'object' ? p.user?.id : p.user
      if (!studentId) continue
      // Skip if application already exists
      const existing = await payload.find({
        collection: 'applications',
        where: {
          and: [
            { event: { equals: eventId } },
            { volunteer: { equals: studentId } },
          ],
        },
        limit: 1,
      })
      if (existing.totalDocs > 0) { skipped++; continue }

      await payload.create({
        collection: 'applications',
        data: {
          event: eventId,
          volunteer: studentId,
          message: (group as any).message || 'Zgłoszenie grupowe',
          status: 'accepted',
          groupApplication: id,
        },
      })
      created++
    }
    console.log('GroupApplications.accept:result', { created, skipped, total: participants.length })

    const updated = await payload.update({
      collection: 'group_applications',
      id,
      data: {
        status: 'accepted',
        processedAt: new Date().toISOString(),
      },
    })

    return Response.json({ success: true, groupApplication: updated })
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}


