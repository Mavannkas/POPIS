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
    hidden: ({ user }) => {
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
      async ({ data, req, operation }) => {
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
      async ({ doc, req, operation, previousDoc }) => {
        // Create notification when invitation is created
        if (operation === 'create') {
          try {
            // Get event details
            const eventId = typeof doc.event === 'object' ? doc.event.id : doc.event
            const event = await req.payload.findByID({
              collection: 'events',
              id: eventId as string,
            })

            const volunteerId = typeof doc.volunteer === 'object' ? doc.volunteer.id : doc.volunteer

            // Create notification in database
            await req.payload.create({
              collection: 'notifications',
              data: {
                type: 'event_invitation',
                recipient: volunteerId,
                event: eventId,
                message: `Zostałeś zaproszony do wydarzenia: ${event.title}`,
                read: false,
                metadata: {
                  invitationId: doc.id,
                  invitedBy: doc.invitedBy,
                },
              },
            })

            console.log('Notification created for invitation:', doc.id)
          } catch (error) {
            console.error('Error creating invitation notification:', error)
          }
        }

        // Create notification to inviter when invitation is responded to
        if (
          operation === 'update' &&
          previousDoc?.status === 'pending' &&
          (doc.status === 'accepted' || doc.status === 'declined')
        ) {
          try {
            // Get event details
            const eventId = typeof doc.event === 'object' ? doc.event.id : doc.event
            const event = await req.payload.findByID({
              collection: 'events',
              id: eventId as string,
            })

            const inviterId = typeof doc.invitedBy === 'object' ? doc.invitedBy.id : doc.invitedBy
            const volunteer = await req.payload.findByID({
              collection: 'users',
              id: typeof doc.volunteer === 'object' ? doc.volunteer.id : doc.volunteer,
            })

            const notificationType = doc.status === 'accepted' ? 'join_request_accepted' : 'join_request_rejected'
            const message = doc.status === 'accepted'
              ? `${volunteer.firstName || 'Wolontariusz'} zaakceptował zaproszenie do wydarzenia "${event.title}"`
              : `${volunteer.firstName || 'Wolontariusz'} odrzucił zaproszenie do wydarzenia "${event.title}"`

            // Create notification in database
            await req.payload.create({
              collection: 'notifications',
              data: {
                type: notificationType,
                recipient: inviterId,
                event: eventId,
                message: message,
                read: false,
                metadata: {
                  invitationId: doc.id,
                  respondedBy: doc.volunteer,
                  action: doc.status,
                },
              },
            })

            console.log('Notification created for invitation response:', doc.id)
          } catch (error) {
            console.error('Error creating invitation response notification:', error)
          }
        }

        // When invitation is accepted, auto-create application
        if (doc.status === 'accepted' && previousDoc?.status === 'pending') {
          try {
            // Create application with accepted status
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
            // Don't throw - allow invitation to be accepted even if application creation fails
          }
        }
      },
    ],
  },
}
