import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'verified'],
  },
  auth: true,
  fields: [
    // Role field - tylko organizatorzy i koordynatorzy
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Organizacja', value: 'organization' },
        { label: 'Koordynator', value: 'coordinator' },
        { label: 'Super Admin', value: 'superadmin' },
      ],
      access: {
        // Only superadmin can change roles
        update: ({ req: { user } }: { req: { user: any } }) => {
          return user?.role === 'superadmin'
        },
      },
    },
    // Basic Info
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    // Account verification
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Konto zatwierdzone przez superadmina',
      },
      access: {
        update: ({ req: { user } }: { req: { user: any } }) => {
          return user?.role === 'superadmin'
        },
      },
    },
    // Organization fields (conditional)
    {
      name: 'organizationName',
      type: 'text',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
    },
    {
      name: 'organizationDescription',
      type: 'textarea',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
    },
    {
      name: 'nip',
      type: 'text',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
    },
    {
      name: 'address',
      type: 'group',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
      fields: [
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'postalCode',
          type: 'text',
        },
      ],
    },
    // Coordinator fields
    {
      name: 'schoolName',
      type: 'text',
      admin: {
        condition: (data: any) => data.role === 'coordinator',
      },
    },
    {
      name: 'schoolAddress',
      type: 'text',
      admin: {
        condition: (data: any) => data.role === 'coordinator',
      },
    },
    // Stream Chat ID
    {
      name: 'streamUserId',
      type: 'text',
      admin: {
        description: 'Stream Chat user ID (auto-generated)',
        readOnly: true,
      },
    },
  ],
  access: {
    // Only superadmin can create admin accounts
    create: ({ req: { user } }: { req: { user: any } }) => {
      return user?.role === 'superadmin'
    },
    // Admins can read other admins
    read: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      // Organization/coordinator can see other admins
      return true
    },
    // Admins can update their own profile, superadmin can update all
    update: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      // Admins can only update themselves
      return {
        id: { equals: user.id },
      }
    },
    // Only superadmin can delete
    delete: ({ req: { user } }: { req: { user: any } }) => {
      return user?.role === 'superadmin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }: { data: any; req: any; operation: string }) => {
        // Set verified to false for new organizations and coordinators
        if (operation === 'create' && (data.role === 'organization' || data.role === 'coordinator')) {
          data.verified = false
        }

        // Superadmin is always verified
        if (data.role === 'superadmin') {
          data.verified = true
        }

        return data
      },
    ],
  },
}
