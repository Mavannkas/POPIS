import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'verified'],
  },
  labels: {
    singular: 'Administrator',
    plural: 'Administratorzy',
  },
  auth: true,
  fields: [
    // Role field - tylko organizatorzy i koordynatorzy
    {
      name: 'role',
      type: 'select',
      required: true,
      label: 'Rola',
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
      label: 'Imię',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Nazwisko',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
    },
    // Account verification
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Zweryfikowany',
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
      label: 'Nazwa organizacji',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
    },
    {
      name: 'organizationDescription',
      type: 'textarea',
      label: 'Opis organizacji',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
    },
    {
      name: 'nip',
      type: 'text',
      label: 'NIP',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
    },
    {
      name: 'address',
      type: 'group',
      label: 'Adres',
      admin: {
        condition: (data: any) => data.role === 'organization',
      },
      fields: [
        {
          name: 'street',
          type: 'text',
          label: 'Ulica',
        },
        {
          name: 'city',
          type: 'text',
          label: 'Miasto',
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'Kod pocztowy',
        },
      ],
    },
    // Coordinator fields
    {
      name: 'schoolName',
      type: 'text',
      label: 'Nazwa szkoły',
      admin: {
        condition: (data: any) => data.role === 'coordinator',
      },
    },
    {
      name: 'schoolAddress',
      type: 'text',
      label: 'Adres szkoły',
      admin: {
        condition: (data: any) => data.role === 'coordinator',
      },
    },
    // Stream Chat ID
    {
      name: 'streamUserId',
      type: 'text',
      label: 'ID użytkownika Stream',
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
        if (
          operation === 'create' &&
          (data.role === 'organization' || data.role === 'coordinator')
        ) {
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
