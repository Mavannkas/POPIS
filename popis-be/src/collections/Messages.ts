import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['application', 'sender', 'receiver', 'content', 'createdAt'],
    hidden: true,
  },
  labels: {
    singular: 'Wiadomość',
    plural: 'Wiadomości',
  },
  fields: [
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      required: true,
      label: 'Aplikacja',
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sender',
          type: 'relationship',
          relationTo: ['users', 'admins'],
          required: true,
          label: 'Nadawca',
          admin: { position: 'sidebar' },
        },
        {
          name: 'receiver',
          type: 'relationship',
          relationTo: ['users', 'admins'],
          required: true,
          label: 'Odbiorca',
          admin: { position: 'sidebar' },
        },
      ],
    },
    {
      name: 'content',
      type: 'text',
      required: true,
      label: 'Treść',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      label: 'Przeczytane',
      admin: { position: 'sidebar' },
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Utworzono',
      admin: { position: 'sidebar', readOnly: true },
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
      ({ data, operation }) => {
        if (operation === 'create') {
          if (!data.createdAt) data.createdAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        try {
          if (operation !== 'create') return
          // Send push notification to receiver if they have Expo token
          const receiver = doc.receiver
          const relationTo = Array.isArray(receiver?.relationTo)
            ? receiver.relationTo[0]
            : receiver?.relationTo
          const receiverId =
            typeof receiver?.value === 'object' ? receiver.value.id : receiver?.value
          if (!relationTo || !receiverId) return

          const receiverDoc = await req.payload.findByID({ collection: relationTo, id: receiverId })
          const expoToken = receiverDoc?.expoPushToken
          if (expoToken) {
            // Derive partner name like chat header (prefer school for school-type events)
            let partnerName = 'Organizator'
            try {
              const appFull = await req.payload.findByID({ collection: 'applications', id: doc.application, depth: 2 })
              const ev: any = appFull?.event
              if (ev && typeof ev === 'object') {
                const school: any = typeof ev.targetSchool === 'object' ? ev.targetSchool : null
                const org: any = typeof ev.organization === 'object' ? ev.organization : null
                const schoolName = ev.eventType === 'school' ? (school?.name || '') : ''
                const orgName = org?.organizationName || [org?.firstName, org?.lastName].filter(Boolean).join(' ').trim()
                const name = (schoolName && schoolName.trim()) ? schoolName : orgName
                if (name && name.trim()) partnerName = name
                else partnerName = ev.eventType === 'school' ? 'Szkoła' : 'Organizator'
              }
            } catch {}

            const title = `Wiadomość od ${partnerName}`
            const body = String(doc.content || '').slice(0, 120)

            // Dynamic import to avoid hard dependency when not used
            const { Expo } = await import('expo-server-sdk')
            const expo = new Expo()
            if (Expo.isExpoPushToken(expoToken)) {
              await expo.sendPushNotificationsAsync([
                {
                  to: expoToken,
                  sound: 'default',
                  title,
                  body,
                  data: {
                    type: 'chat_message',
                    applicationId: doc.application,
                  },
                } as any,
              ])
            }
          }

          // Additionally, create in-app notification for volunteer when organizer writes
          const senderRel = Array.isArray(doc.sender?.relationTo)
            ? doc.sender.relationTo[0]
            : doc.sender?.relationTo
          const receiverRel = relationTo
          if (senderRel === 'admins' && receiverRel === 'users') {
            try {
              let eventId: any = null
              try {
                const appDoc = await req.payload.findByID({ collection: 'applications', id: doc.application, depth: 0 })
                eventId = typeof appDoc?.event === 'object' ? appDoc.event?.id : appDoc?.event
              } catch {}
              await req.payload.create({
                collection: 'notifications',
                data: {
                  user: receiverId,
                  type: 'chat_message',
                  application: doc.application,
                  event: eventId || undefined,
                  message: String(doc.content || '').slice(0, 200),
                  isRead: false,
                  actionRequired: false,
                  createdAt: new Date().toISOString(),
                },
                req,
              })
            } catch (e) {
              console.error('Error creating chat notification:', e)
            }
          }
        } catch (e) {
          console.error('Error sending push notification for message:', e)
        }
      },
    ],
  },
}
