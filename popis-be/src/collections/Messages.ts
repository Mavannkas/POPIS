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
          if (!expoToken) return

          const title = 'Nowa wiadomość'
          const body = String(doc.content || '').slice(0, 120)

          // Dynamic import to avoid hard dependency when not used
          const { Expo } = await import('expo-server-sdk')
          const expo = new Expo()
          if (!Expo.isExpoPushToken(expoToken)) return

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
        } catch (e) {
          console.error('Error sending push notification for message:', e)
        }
      },
    ],
  },
}
