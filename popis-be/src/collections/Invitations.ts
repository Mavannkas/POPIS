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
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'admins',
      required: true,
      label: 'Zaproszony przez',
      admin: {
        description: 'Kto wysłał zaproszenie (organizacja lub koordynator)',
        readOnly: true,
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
      name: 'invitedAt',
      type: 'date',
      required: true,
      label: 'Data zaproszenia',
      admin: {
        readOnly: true,
        description: 'Data wysłania zaproszenia',
      },
    },
    {
      name: 'respondedAt',
      type: 'date',
      label: 'Data odpowiedzi',
      admin: {
        readOnly: true,
        description: 'Data odpowiedzi na zaproszenie',
      },
    },
  ],
  access: {
    // Organizations and coordinators can create invitations
    create: ({ req: { user } }) => {
      if (!user) return false
      return ['organization', 'coordinator', 'superadmin'].includes(user.role)
    },
    // Volunteers see their own, organizations/coordinators see invitations they sent
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true

      if (user.role === 'volunteer') {
        return {
          volunteer: { equals: user.id },
        }
      }

      if (user.role === 'organization' || user.role === 'coordinator') {
        return {
          invitedBy: { equals: user.id },
        }
      }

      return false
    },
    // Only volunteers can update (respond to) invitations
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true

      if (user.role === 'volunteer') {
        return {
          volunteer: { equals: user.id },
          status: { equals: 'pending' }, // Can only respond to pending invitations
        }
      }

      return false
    },
    // Only creator and superadmin can delete
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true

      return {
        invitedBy: { equals: user.id },
      }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Set invitedBy and invitedAt on create
        if (operation === 'create') {
          data.invitedBy = req.user?.id
          data.invitedAt = new Date().toISOString()
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
