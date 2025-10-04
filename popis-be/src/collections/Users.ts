import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'verified'],
  },
  auth: true,
  fields: [
    // Role field - CRITICAL
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'volunteer',
      options: [
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Wolontariusz', value: 'volunteer' },
        { label: 'Organizacja', value: 'organization' },
        { label: 'Koordynator', value: 'coordinator' },
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
    {
      name: 'birthDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Wymagane do określenia czy osoba jest małoletnia',
      },
    },
    {
      name: 'isMinor',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Automatycznie wyliczane na podstawie daty urodzenia',
        readOnly: true,
      },
    },
    // Account verification
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Konto zatwierdzone przez superadmina (dotyczy organizacji i koordynatorów)',
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
    // Anyone can create account (public registration)
    create: () => true,
    // Authenticated users can read other users (basic info only)
    read: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      // Others can read verified users
      return {
        verified: { equals: true },
      }
    },
    // Users can update their own profile, superadmin can update all
    update: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      // Users can only update themselves
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
        // Auto-calculate isMinor based on birthDate
        if (data.birthDate) {
          const birthDate = new Date(data.birthDate)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            data.isMinor = age - 1 < 18
          } else {
            data.isMinor = age < 18
          }
        }

        // Set verified to false for new organizations and coordinators
        if (operation === 'create' && (data.role === 'organization' || data.role === 'coordinator')) {
          data.verified = false
        }

        // Superadmin is always verified
        if (data.role === 'superadmin') {
          data.verified = true
        }

        // Volunteers are auto-verified
        if (data.role === 'volunteer') {
          data.verified = true
        }

        return data
      },
    ],
  },
}
