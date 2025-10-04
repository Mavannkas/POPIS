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
      type: 'row',
      fields: [
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
      ],
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
        position: 'sidebar',
        description: 'Typ szkoły',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      required: true,
      unique: true,
      label: 'ID zewnętrzne',
      admin: {
        position: 'sidebar',
        description: 'ID szkoły z zewnętrznego API (np. RSPO)',
      },
    },
  ],
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
}

