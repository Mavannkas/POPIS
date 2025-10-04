import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'organization', 'category', 'startDate', 'status'],
    // Tylko organizatorzy i koordynatorzy mają dostęp do admin panelu
    hidden: ({ user }: { user: any }) => {
      return !['organization', 'coordinator', 'superadmin'].includes(user?.role)
    },
  },
  labels: {
    singular: 'Wydarzenie',
    plural: 'Wydarzenia',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tytuł',
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Opis',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'admins',
      required: true,
      filterOptions: {
        role: { equals: 'organization' },
      },
      label: 'Organizacja',
      admin: {
        description: 'Organizacja odpowiedzialna za wydarzenie',
      },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      defaultValue: 'public',
      label: 'Typ wydarzenia',
      options: [
        { label: 'Wydarzenie publiczne', value: 'public' },
        { label: 'Wydarzenie szkolne', value: 'school' },
      ],
      admin: {
        description: 'Typ wydarzenia: publiczne (dla wszystkich) lub szkolne (tylko dla uczniów)',
      },
    },
    {
      name: 'targetSchool',
      type: 'relationship',
      relationTo: 'schools',
      label: 'Szkoła docelowa',
      admin: {
        description: 'Szkoła docelowa (opcjonalne, dla wydarzeń szkolnych)',
        condition: (data: any) => data.eventType === 'school',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Kategoria',
      options: [
        { label: 'Edukacja', value: 'education' },
        { label: 'Środowisko', value: 'environment' },
        { label: 'Pomoc społeczna', value: 'social' },
        { label: 'Zdrowie', value: 'health' },
        { label: 'Zwierzęta', value: 'animals' },
        { label: 'Kultura', value: 'culture' },
        { label: 'Sport', value: 'sport' },
        { label: 'Inne', value: 'other' },
      ],
    },
    {
      name: 'size',
      type: 'select',
      required: true,
      label: 'Rozmiar',
      options: [
        { label: 'Małe', value: 'small' },
        { label: 'Średnie', value: 'medium' },
        { label: 'Duże', value: 'large' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      label: 'Lokalizacja',
      fields: [
        {
          name: 'address',
          type: 'text',
          required: true,
          label: 'Adres',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'Miasto',
        },
        {
          name: 'lat',
          type: 'number',
          label: 'Szerokość geograficzna',
          admin: {
            description: 'Szerokość geograficzna (dla mapy)',
          },
        },
        {
          name: 'lng',
          type: 'number',
          label: 'Długość geograficzna',
          admin: {
            description: 'Długość geograficzna (dla mapy)',
          },
        },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Data rozpoczęcia',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Data zakończenia',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      label: 'Czas trwania (w godzinach)',
      admin: {
        description: 'Przewidywana liczba godzin wolontariatu',
      },
    },
    {
      name: 'minAge',
      type: 'number',
      min: 13,
      defaultValue: 13,
      required: true,
      label: 'Minimalny wiek',
      admin: {
        description: 'Minimalny wiek uczestnika',
      },
    },
    {
      name: 'maxVolunteers',
      type: 'number',
      label: 'Maksymalna liczba wolontariuszy',
      admin: {
        description: 'Maksymalna liczba wolontariuszy (opcjonalne)',
      },
    },
    {
      name: 'requirements',
      type: 'textarea',
      label: 'Wymagania',
      admin: {
        description: 'Wymagania dla wolontariuszy',
      },
    },
    {
      name: 'additionalInfo',
      type: 'textarea',
      label: 'Dodatkowe informacje',
      admin: {
        description: 'Dodatkowe informacje o wydarzeniu (opcjonalne)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Status',
      options: [
        { label: 'Wersja robocza', value: 'draft' },
        { label: 'Opublikowane', value: 'published' },
        { label: 'Zakończone', value: 'completed' },
        { label: 'Anulowane', value: 'cancelled' },
      ],
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      label: 'Zdjęcie',
      admin: {
        description: 'Główne zdjęcie wydarzenia',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'admins',
      label: 'Utworzone przez',
      admin: {
        readOnly: true,
        description: 'Użytkownik który stworzył wydarzenie',
      },
    },
  ],
  access: {
    // Organizations and coordinators can create events
    create: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      return ['organization', 'coordinator', 'superadmin'].includes(user.role)
    },
    // Published events are public, others only for owner and superadmin
    read: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) {
        // Public can see only published public events
        return {
          and: [{ status: { equals: 'published' } }, { eventType: { equals: 'public' } }],
        }
      }
      if (user.role === 'superadmin') return true

      if (user.role === 'volunteer') {
        // Volunteers see published events based on their student status
        const conditions: any = {
          status: { equals: 'published' },
        }

        // If not a student, can only see public events
        if (!user.isStudent) {
          conditions.eventType = { equals: 'public' }
        } else {
          // Students can see:
          // 1. All public events
          // 2. School events for their school (or without targetSchool)
          conditions.or = [
            { eventType: { equals: 'public' } },
            {
              and: [
                { eventType: { equals: 'school' } },
                {
                  or: [
                    { targetSchool: { exists: false } },
                    { targetSchool: { equals: null } },
                    { targetSchool: { equals: user.school } },
                  ],
                },
              ],
            },
          ]
        }

        return conditions
      }

      // Organization/coordinator can see their own events
      return {
        or: [
          { status: { equals: 'published' } },
          { createdBy: { equals: user.id } },
          { organization: { equals: user.id } },
        ],
      }
    },
    // Only owner and superadmin can update
    update: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      return {
        or: [{ createdBy: { equals: user.id } }, { organization: { equals: user.id } }],
      }
    },
    // Only owner and superadmin can delete
    delete: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      return {
        or: [{ createdBy: { equals: user.id } }, { organization: { equals: user.id } }],
      }
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }: { data: any; req: any; operation: string }) => {
        // Auto-set createdBy on create
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
        }

        // Validate dates
        if (data.startDate && data.endDate) {
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)
          if (end < start) {
            throw new Error('Data zakończenia nie może być wcześniejsza niż data rozpoczęcia')
          }
        }

        return data
      },
    ],
  },
}
