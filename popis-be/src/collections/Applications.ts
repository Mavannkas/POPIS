import type { CollectionConfig } from 'payload'

export const Applications: CollectionConfig = {
  slug: 'applications',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'volunteer', 'status', 'appliedAt'],
    // Tylko organizatorzy i koordynatorzy mają dostęp do admin panelu
    hidden: ({ user }) => {
      return !['organization', 'coordinator', 'superadmin'].includes(user?.role)
    },
  },
  labels: {
    singular: 'Aplikacja',
    plural: 'Aplikacje',
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
        },
        {
          name: 'volunteer',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          label: 'Wolontariusz',
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Wiadomość',
      admin: {
        description: 'Wiadomość od wolontariusza',
      },
    },
    {
      name: 'hoursWorked',
      type: 'number',
      label: 'Przepracowane godziny',
      admin: {
        description: 'Liczba przepracowanych godzin (wypełnia organizacja)',
      },
    },
    {
      name: 'organizationNotes',
      type: 'textarea',
      label: 'Notatki organizacji',
      admin: {
        description: 'Notatki organizacji (widoczne tylko dla organizacji i superadmina)',
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
        { label: 'Odrzucone', value: 'rejected' },
        { label: 'Ukończone', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'appliedAt',
      type: 'date',
      label: 'Data zgłoszenia',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Data ukończenia',
      admin: {
        position: 'sidebar',
        description: 'Data ukończenia wolontariatu',
      },
    },
    {
      name: 'chatChannelId',
      type: 'text',
      label: 'ID kanału czatu',
      admin: {
        position: 'sidebar',
        description: 'Stream Chat channel ID (auto-generated po akceptacji)',
        readOnly: true,
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
        // Set appliedAt on create
        if (operation === 'create') {
          data.appliedAt = new Date().toISOString()
        }

        // Set completedAt when status changes to completed
        if (data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        // When status changes to 'accepted', create Stream Chat channel
        if (doc.status === 'accepted' && previousDoc?.status !== 'accepted') {
          try {
            // Import streamChat helper
            const { createChatChannel } = await import('../lib/streamChat')

            // Get full event data
            const event = await req.payload.findByID({
              collection: 'events',
              id: doc.event as string,
            })

            // Get volunteer and organization IDs
            const volunteerId = typeof doc.volunteer === 'object' ? doc.volunteer.id : doc.volunteer
            const organizationId =
              typeof event.organization === 'object' ? event.organization.id : event.organization

            // Create chat channel
            const channelId = await createChatChannel(
              volunteerId,
              organizationId.toString(),
              doc.id,
              event.title,
            )

            // Update application with channel ID
            await req.payload.update({
              collection: 'applications',
              id: doc.id,
              data: {
                chatChannelId: channelId,
              },
            })

            console.log('Created Stream Chat channel:', channelId)
          } catch (error) {
            console.error('Error creating Stream Chat channel:', error)
            // Don't throw - allow application to be accepted even if chat fails
          }
        }

        // When status changes to 'completed', auto-create certificate
        if (doc.status === 'completed' && previousDoc?.status !== 'completed') {
          try {
            const payload = req.payload

            // Check if certificate already exists
            const existingCerts = await payload.find({
              collection: 'certificates',
              where: {
                application: { equals: doc.id },
              },
            })

            if (existingCerts.docs.length === 0) {
              // Create certificate
              await payload.create({
                collection: 'certificates',
                data: {
                  application: doc.id,
                  volunteer: doc.volunteer,
                  event: doc.event,
                  hoursWorked: doc.hoursWorked || 0,
                  status: 'pending',
                  issueDate: new Date().toISOString(),
                  certificateNumber:
                    'CERT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                },
                req,
              })
              console.log('Auto-created certificate for application:', doc.id)
            }
          } catch (error) {
            console.error('Error auto-creating certificate:', error)
          }
        }
      },
    ],
  },
}
