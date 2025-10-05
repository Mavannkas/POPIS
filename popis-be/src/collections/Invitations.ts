import type { CollectionConfig } from 'payload'

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  labels: {
    singular: 'Zaproszenie',
    plural: 'Zaproszenia',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'volunteer', 'invitedBy', 'status', 'invitedAt'],
    hidden: ({ user }: { user: any }) => {
      return !['organization', 'coordinator', 'superadmin'].includes(user?.role)
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          required: true,
          label: 'Wydarzenie',
          admin: {
            description: 'Wydarzenie do którego zapraszamy',
          },
        },
        {
          name: 'volunteer',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          label: 'Wolontariusz',
          admin: {
            description: 'Zaproszony wolontariusz',
          },
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Wiadomość',
      admin: {
        description: 'Wiadomość dla wolontariusza (opcjonalne)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Status',
      options: [
        { label: 'Oczekujące', value: 'pending' },
        { label: 'Zaakceptowane', value: 'accepted' },
        { label: 'Odrzucone', value: 'declined' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'admins',
      required: true,
      label: 'Zaproszony przez',
      admin: {
        position: 'sidebar',
        description: 'Kto wysłał zaproszenie (organizacja lub koordynator)',
        readOnly: true,
      },
    },
    {
      name: 'invitedAt',
      type: 'date',
      required: true,
      label: 'Data zaproszenia',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Data wysłania zaproszenia',
      },
    },
    {
      name: 'respondedAt',
      type: 'date',
      label: 'Data odpowiedzi',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Data odpowiedzi na zaproszenie',
      },
    },
  ],
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }: { data: any; req: any; operation: string }) => {
        // Set invitedBy and invitedAt on create
        if (operation === 'create') {
          if (!data.invitedBy) {
            data.invitedBy = req.user?.id
          }
          if (!data.invitedAt) {
            data.invitedAt = new Date().toISOString()
          }
        }

        // Set respondedAt when status changes from pending
        if (operation === 'update' && data.status !== 'pending' && !data.respondedAt) {
          data.respondedAt = new Date().toISOString()
        }

        // Validate: check if volunteer is not already applied to this event
        if (operation === 'create') {
          const existingApplication = await req.payload.find({
            collection: 'applications',
            where: {
              and: [{ event: { equals: data.event } }, { volunteer: { equals: data.volunteer } }],
            },
          })

          if (existingApplication.docs.length > 0) {
            throw new Error('Ten wolontariusz już zgłosił się do tego wydarzenia')
          }

          // Check if invitation already exists
          const existingInvitation = await req.payload.find({
            collection: 'invitations',
            where: {
              and: [
                { event: { equals: data.event } },
                { volunteer: { equals: data.volunteer } },
                { status: { equals: 'pending' } },
              ],
            },
          })

          if (existingInvitation.docs.length > 0) {
            throw new Error('Zaproszenie dla tego wolontariusza już istnieje')
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({
        doc,
        req,
        operation,
        previousDoc,
      }: {
        doc: any
        req: any
        operation: string
        previousDoc: any
      }) => {
        try {
          // On create, create a notification for the volunteer
          if (operation === 'create') {
            const volunteerId = typeof doc.volunteer === 'object' ? doc.volunteer.id : doc.volunteer
            await req.payload.create({
              collection: 'notifications',
              data: {
                user: volunteerId,
                type: 'event_invitation',
                event: doc.event,
                invitation: doc.id,
                isRead: false,
                actionRequired: true,
                message: doc.message || 'Otrzymałeś zaproszenie na wydarzenie.',
                createdAt: new Date().toISOString(),
              },
              req,
            })
          }

          // When invitation is accepted, auto-create application
          if (doc.status === 'accepted' && previousDoc?.status === 'pending') {
            try {
              await req.payload.create({
                collection: 'applications',
                data: {
                  event: doc.event,
                  volunteer: doc.volunteer,
                  status: 'accepted',
                  message: `Zaakceptowano zaproszenie od ${req.user?.firstName || 'organizatora'}`,
                },
              })
              console.log('Auto-created application for accepted invitation:', doc.id)
            } catch (error) {
              console.error('Error auto-creating application:', error)
            }
          }

          // When status changes from pending -> accepted/declined, mark related notifications handled
          if (previousDoc?.status === 'pending' && doc.status !== 'pending') {
            const notifList = await req.payload.find({
              collection: 'notifications',
              where: { invitation: { equals: doc.id } },
              limit: 100,
            })
            for (const n of notifList.docs) {
              await req.payload.update({
                collection: 'notifications',
                id: n.id,
                data: { isRead: true, actionRequired: false },
              })
            }
          }
        } catch (error) {
          console.error('Invitation hook notification error:', error)
        }
      },
    ],
  },
}
