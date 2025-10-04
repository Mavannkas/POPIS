import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    // Tylko organizatorzy i koordynatorzy mają dostęp do admin panelu
    hidden: ({ user }) => {
      return !['organization', 'coordinator', 'superadmin'].includes(user?.role)
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
