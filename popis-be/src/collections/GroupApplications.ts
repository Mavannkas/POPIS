import type { CollectionConfig } from 'payload'

export const GroupApplications: CollectionConfig = {
  slug: 'group_applications',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'coordinator', 'studentsCount', 'status', 'createdAt'],
    hidden: ({ user }: { user: any }) => {
      return !['organization', 'coordinator', 'superadmin'].includes(user?.role)
    },
  },
  labels: {
    singular: 'Zgłoszenie grupowe',
    plural: 'Zgłoszenia grupowe',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'targetEvent',
          type: 'relationship',
          relationTo: 'events',
          required: true,
          label: 'Docelowe wydarzenie',
          admin: {
            appearance: 'drawer',
          },
          filterOptions: () => ({
            eventType: { equals: 'public' },
          }),
          access: {
            update: ({ req }: { req: any }) => req?.user?.role !== 'organization',
          },
        },
        {
          name: 'coordinator',
          type: 'relationship',
          relationTo: 'admins',
          required: true,
          label: 'Koordynator',
          admin: {
            readOnly: true,
            description: 'Automatycznie ustawiany na aktualnie zalogowanego użytkownika',
          },
          defaultValue: ({ user }: { user: any }) => user?.id,
        },
      ],
    },
    {
      name: 'sourceSchoolEvent',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      label: 'Wydarzenie szkolne (źródło)',
      admin: {
        description: 'Wybierz szkolne wydarzenie z zebranymi uczniami',
      },
      filterOptions: ({ user }: { user: any }) => {
        console.log('GroupApplications.filterOptions', {
          userId: user?.id,
          role: user?.role,
          hasSchool: !!user?.schoolName,
        })
        // Coordinators: only school events from their school
        if (user?.role === 'coordinator') {
          const coordinatorSchool = user?.schoolName
          const coordinatorSchoolId = typeof coordinatorSchool === 'object' ? coordinatorSchool?.id : coordinatorSchool
          if (!coordinatorSchoolId) {
            return { eventType: { equals: 'school' } }
          }
          return {
            and: [
              { eventType: { equals: 'school' } },
              { targetSchool: { equals: coordinatorSchoolId } },
            ],
          }
        }
        // Organizations and superadmins: no filter to avoid invalid existing selections
        return {}
      },
      access: {
        update: ({ req }: { req: any }) => req?.user?.role !== 'organization',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Wiadomość od koordynatora',
      access: {
        update: ({ req }: { req: any }) => req?.user?.role !== 'organization',
      },
    },
    
    {
      name: 'studentsCount',
      type: 'number',
      label: 'Liczba uczniów',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Oczekujące', value: 'pending' },
        { label: 'Zaakceptowane', value: 'accepted' },
        { label: 'Odrzucone', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Utworzono',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'processedAt',
      type: 'date',
      label: 'Przetworzono',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  access: {
    create: ({ req }: { req: any }) => {
      return ['coordinator', 'superadmin'].includes(req?.user?.role)
    },
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }: { data: any; req: any; operation: string }) => {
        try {
          const targetEventId = typeof data.targetEvent === 'object' ? data.targetEvent?.id : data.targetEvent
          const sourceEventId = typeof data.sourceSchoolEvent === 'object' ? data.sourceSchoolEvent?.id : data.sourceSchoolEvent
          console.log('GroupApplications.beforeValidate:start', {
            op: operation,
            userId: req?.user?.id,
            targetEventId,
            sourceEventId,
          })
        } catch {}
        // Force coordinator to current user on create
        if (operation === 'create' && req?.user) {
          data.coordinator = req.user.id
        }
        // Validate target event and source school event only on create or when these fields are updated
        const targetEventId = typeof data.targetEvent === 'object' ? data.targetEvent?.id : data.targetEvent
        const sourceEventId = typeof data.sourceSchoolEvent === 'object' ? data.sourceSchoolEvent?.id : data.sourceSchoolEvent
        const shouldValidateEvents =
          operation === 'create' || typeof data.targetEvent !== 'undefined' || typeof data.sourceSchoolEvent !== 'undefined'
        if (!shouldValidateEvents) return data
        if (!targetEventId || !sourceEventId) return data
        try {
          const target = await req.payload.findByID({ collection: 'events', id: targetEventId })
          if (!target) throw new Error('Target event not found')
          if (target.status !== 'published') throw new Error('Target event is not published')

          const source = await req.payload.findByID({ collection: 'events', id: sourceEventId })
          if (!source) throw new Error('Source school event not found')
          if (source.eventType !== 'school') throw new Error('Source event must be of type school')
          console.log('GroupApplications.beforeValidate:events', {
            targetId: (target as any).id,
            targetStatus: target.status,
            sourceId: (source as any).id,
            sourceType: source.eventType,
            sourceTargetSchool: source.targetSchool,
          })

          // Ensure coordinator belongs to the school of the source event if targetSchool is set
          if (source.targetSchool && req?.user?.role === 'coordinator') {
            const targetSchoolId = typeof source.targetSchool === 'object' ? source.targetSchool.id : source.targetSchool
            const coordinatorSchool = req?.user?.schoolName
            const coordinatorSchoolId = typeof coordinatorSchool === 'object' ? coordinatorSchool?.id : coordinatorSchool
            if (!coordinatorSchoolId || String(coordinatorSchoolId) !== String(targetSchoolId)) {
              throw new Error('Coordinator can only submit groups from their own school')
            }
          }

          const participants = Array.isArray(source.participants) ? source.participants : []
          const eligible = participants.filter((p: any) => !!p?.user && p.isAccepted !== false)
          console.log('GroupApplications.beforeValidate:participants', {
            participants: participants.length,
            eligible: eligible.length,
          })
          data.studentsCount = eligible.length
        } catch (e: any) {
          throw new Error(e?.message || 'Validation failed')
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }: { data: any; req: any; operation: string; originalDoc: any }) => {
        // Organizations: allow updating only status on their own targetEvent
        if (operation === 'update' && req?.user?.role === 'organization') {
          try {
            const targetEventId = typeof originalDoc?.targetEvent === 'object' ? originalDoc?.targetEvent?.id : originalDoc?.targetEvent
            if (!targetEventId) {
              throw new Error('Missing target event on group application')
            }
            const ev = await req.payload.findByID({ collection: 'events', id: targetEventId })
            const ownerId = typeof ev.organization === 'object' ? (ev.organization as any)?.id : ev.organization
            if (String(ownerId) !== String(req.user.id)) {
              throw new Error('You can only update status for your own events')
            }
            // Enforce only status can be updated
            const allowedKeys = new Set(['status'])
            const dataKeys = Object.keys(data || {})
            const illegal = dataKeys.filter((k) => !allowedKeys.has(k))
            if (illegal.length > 0) {
              throw new Error('Only status can be updated by organization')
            }
          } catch (e: any) {
            throw e
          }
        }
        if (operation === 'create') {
          data.createdAt = new Date().toISOString()
        }
        // Ensure studentsCount persists
        try {
          console.log('GroupApplications.beforeChange', {
            op: operation,
            userId: req?.user?.id,
            studentsCount: data?.studentsCount,
          })
        } catch {}
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }: { doc: any; previousDoc: any; req: any }) => {
        // Handle status transitions
        if (doc?.status && previousDoc?.status !== doc.status) {
          if (doc.status === 'accepted') {
            const eventId = typeof doc.targetEvent === 'object' ? doc.targetEvent.id : doc.targetEvent
            const source = typeof doc.sourceSchoolEvent === 'object' ? doc.sourceSchoolEvent : await req.payload.findByID({ collection: 'events', id: doc.sourceSchoolEvent })
            const participants = Array.isArray((source as any).participants) ? (source as any).participants : []
            let created = 0
            let skipped = 0
            for (const p of participants) {
              const studentId = typeof p.user === 'object' ? p.user?.id : p.user
              if (!studentId) continue
              if (p.isAccepted === false) continue
              const existing = await req.payload.find({
                collection: 'applications',
                where: { and: [ { event: { equals: eventId } }, { volunteer: { equals: studentId } } ] },
                limit: 1,
              })
              if (existing.totalDocs > 0) { skipped++; continue }
              await req.payload.create({
                collection: 'applications',
                data: {
                  event: eventId,
                  volunteer: studentId,
                  message: doc.message || 'Zgłoszenie grupowe',
                  status: 'accepted',
                  groupApplication: doc.id,
                },
                req,
              })
              created++
            }
            console.log('GroupApplications.afterChange:accepted', {
              groupId: doc?.id,
              eventId,
              totalParticipants: participants.length,
              created,
              skipped,
            })
            // mark processedAt if not set
            if (!doc.processedAt) {
              await req.payload.update({
                collection: 'group_applications',
                id: doc.id,
                data: { processedAt: new Date().toISOString() },
              })
            }
          }
          if (doc.status === 'rejected') {
            console.log('GroupApplications.afterChange:rejected', { groupId: doc?.id })
            if (!doc.processedAt) {
              await req.payload.update({
                collection: 'group_applications',
                id: doc.id,
                data: { processedAt: new Date().toISOString() },
              })
            }
          }
        }
      },
    ],
  },
}


