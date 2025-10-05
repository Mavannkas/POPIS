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

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!['organization', 'superadmin'].includes(user.role)) {
      return Response.json(
        { success: false, error: 'Only organizations can reject group applications' },
        { status: 403 }
      )
    }

    const group = await payload.findByID({ collection: 'group_applications', id, depth: 2 })
    if (!group) {
      return Response.json({ success: false, error: 'Group application not found' }, { status: 404 })
    }

    // Verify ownership
    if (user.role !== 'superadmin') {
      const event: any = group.event
      const orgId = typeof event.organization === 'object' ? event.organization.id : event.organization
      if (String(orgId) !== String(user.id)) {
        return Response.json(
          { success: false, error: 'You can only reject for your own events' },
          { status: 403 }
        )
      }
    }

    if (group.status !== 'pending') {
      return Response.json({ success: false, error: 'Group application already processed' }, { status: 400 })
    }

    const updated = await payload.update({
      collection: 'group_applications',
      id,
      data: {
        status: 'rejected',
        processedAt: new Date().toISOString(),
      },
    })

    return Response.json({ success: true, groupApplication: updated })
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}


