import type { CollectionConfig } from 'payload'

export const Schools: CollectionConfig = {
  slug: 'schools',
  labels: {
    singular: 'Szkoła',
    plural: 'Szkoły',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'type'],
    description: 'Cache szkół wybranych przez użytkowników (dane z zewnętrznego API)',
  },
  fields: [
    {
      name: 'externalId',
      type: 'text',
      required: true,
      unique: true,
      label: 'ID zewnętrzne',
      admin: {
        description: 'ID szkoły z zewnętrznego API (np. RSPO)',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nazwa',
      admin: {
        description: 'Nazwa szkoły',
      },
    },
    {
      name: 'address',
      type: 'text',
      label: 'Adres',
      admin: {
        description: 'Adres szkoły',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      label: 'Miasto',
      admin: {
        description: 'Miasto',
      },
    },
    {
      name: 'postalCode',
      type: 'text',
      label: 'Kod pocztowy',
      admin: {
        description: 'Kod pocztowy',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Typ szkoły',
      options: [
        { label: 'Liceum Ogólnokształcące', value: 'liceum' },
        { label: 'Technikum', value: 'technikum' },
        { label: 'Szkoła Branżowa', value: 'branzowa' },
        { label: 'Inna', value: 'other' },
      ],
      admin: {
        description: 'Typ szkoły',
      },
    },
  ],
  access: {
    // Anyone authenticated can read schools
    create: () => true, // Backend API will create schools
    read: () => true, // Public read access
    update: ({ req: { user } }) => {
      return user?.role === 'superadmin'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'superadmin'
    },
  },
}

