import type { CollectionConfig } from 'payload'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'certificateNumber',
    defaultColumns: ['certificateNumber', 'volunteer', 'event', 'status', 'issueDate'],
  },
  fields: [
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      required: true,
      unique: true,
      admin: {
        description: 'Powiązane zgłoszenie',
      },
    },
    {
      name: 'volunteer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: { equals: 'volunteer' },
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: { equals: 'organization' },
      },
      admin: {
        description: 'Wypełniane automatycznie z wydarzenia',
      },
    },
    {
      name: 'hoursWorked',
      type: 'number',
      required: true,
      admin: {
        description: 'Liczba przepracowanych godzin',
      },
    },
    {
      name: 'issuedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Kto wystawił zaświadczenie (organizacja lub koordynator)',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: { equals: 'coordinator' },
      },
      admin: {
        description: 'Koordynator który zatwierdził (opcjonalne)',
      },
    },
    {
      name: 'issueDate',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'Data wystawienia',
      },
    },
    {
      name: 'certificateNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Unikalny numer zaświadczenia',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Oczekujące', value: 'pending' },
        { label: 'Wystawione', value: 'issued' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Dodatkowe uwagi',
      },
    },
  ],
  access: {
    // Organizations and coordinators can create certificates
    create: ({ req: { user } }) => {
      if (!user) return false
      return ['organization', 'coordinator', 'superadmin'].includes(user.role)
    },
    // Volunteers see their own, organizations see their certificates
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      if (user.role === 'volunteer') {
        return {
          volunteer: { equals: user.id },
        }
      }
      if (user.role === 'organization') {
        return {
          organization: { equals: user.id },
        }
      }
      if (user.role === 'coordinator') {
        // Coordinators can see all certificates (for their school - simplified for hackathon)
        return true
      }
      return false
    },
    // Organizations and coordinators can update
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      if (user.role === 'organization' || user.role === 'coordinator') {
        return true
      }
      return false
    },
    // Only superadmin can delete
    delete: ({ req: { user } }) => {
      return user?.role === 'superadmin'
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Generate certificate number on create
        if (operation === 'create') {
          const year = new Date().getFullYear()
          const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
          data.certificateNumber = `CERT-${year}-${randomId}`
          data.issueDate = new Date().toISOString()
          data.issuedBy = req.user?.id
        }

        // Get organization from event if not set
        if (operation === 'create' && data.event && !data.organization) {
          try {
            const event = await req.payload.findByID({
              collection: 'events',
              id: data.event,
            })
            data.organization = event.organization
          } catch (error) {
            console.error('Error fetching event for certificate:', error)
          }
        }

        return data
      },
    ],
  },
}

