import type { CollectionConfig } from 'payload'
import { NotificationTypeCell } from '@/components/AdminDashboard/components/NotificationTypeCell'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['user', 'type', 'event', 'isRead', 'actionRequired', 'createdAt'],
  },
  labels: {
    singular: 'Powiadomienie',
    plural: 'Powiadomienia',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Użytkownik',
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Typ',
      options: [
        { label: 'Decyzja o akceptacji', value: 'approval_decision' },
        { label: 'Zaproszenie na wydarzenie', value: 'event_invitation' },
        { label: 'Wiadomość czatu', value: 'chat_message' },
      ],
      admin: {
        position: 'sidebar',
        components: {
          Cell: '@/components/AdminDashboard/components/NotificationTypeCell#NotificationTypeCell',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          label: 'Wydarzenie',
        },
        {
          name: 'invitation',
          type: 'relationship',
          relationTo: 'invitations',
          label: 'Zaproszenie',
        },
        {
          name: 'application',
          type: 'relationship',
          relationTo: 'applications',
          label: 'Aplikacja (czat)',
        },
      ],
    },
    {
      name: 'decision',
      type: 'select',
      label: 'Decyzja',
      options: [
        { label: 'Zaakceptowano', value: 'accepted' },
        { label: 'Odrzucono', value: 'rejected' },
      ],
    },
    {
      name: 'message',
      type: 'text',
      label: 'Wiadomość',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isRead',
          type: 'checkbox',
          defaultValue: false,
          label: 'Przeczytane',
          admin: { position: 'sidebar' },
        },
        {
          name: 'actionRequired',
          type: 'checkbox',
          defaultValue: false,
          label: 'Wymaga akcji',
          admin: { position: 'sidebar' },
        },
      ],
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
      ({ data, operation }: { data: any; operation: string }) => {
        if (operation === 'create') {
          if (!data.createdAt) {
            data.createdAt = new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
}
