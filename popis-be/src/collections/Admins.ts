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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Podstawowe dane',
          fields: [
            {
              type: 'row',
              fields: [
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
              ],
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Telefon',
            },
          ],
        },
        {
          label: 'Dane organizacji',
          fields: [
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
                  type: 'row',
                  fields: [
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
              ],
            },
          ],
        },
        {
          label: 'Dane koordynatora',
          fields: [
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
          ],
        },
      ],
    },
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Zweryfikowany',
      admin: {
        position: 'sidebar',
        description: 'Konto zatwierdzone przez superadmina',
      },
    },
    {
      name: 'streamUserId',
      type: 'text',
      label: 'ID użytkownika Stream',
      admin: {
        position: 'sidebar',
        description: 'Stream Chat user ID (auto-generated)',
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
