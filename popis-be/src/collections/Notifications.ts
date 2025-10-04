import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Users can only read their own notifications
      return {
        recipient: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      // Only authenticated users can create notifications (system will do this)
      return !!user
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Users can only update their own notifications (mark as read)
      return {
        recipient: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      // Users can delete their own notifications
      return {
        recipient: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Zaproszenie do wydarzenia',
          value: 'event_invitation',
        },
        {
          label: 'Prośba zaakceptowana',
          value: 'join_request_accepted',
        },
        {
          label: 'Prośba odrzucona',
          value: 'join_request_rejected',
        },
      ],
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      hasMany: false,
    },
    {
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data specific to notification type',
      },
    },
  ],
  timestamps: true,
}
