import type { CollectionConfig } from 'payload'
import { LocationPicker } from '../components/LocationPicker'

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
      type: 'tabs',
      tabs: [
        {
          label: 'Podstawowe informacje',
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
              type: 'row',
              fields: [
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
              ],
            },
            {
              type: 'row',
              fields: [
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
                    description:
                      'Typ wydarzenia: publiczne (dla wszystkich) lub szkolne (tylko dla uczniów)',
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
          ],
        },
        {
          label: 'Lokalizacja i terminy',
          fields: [
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
                  name: 'mapPicker',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/components/LocationPicker#LocationPicker',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'lat',
                      type: 'number',
                      label: 'Szerokość geograficzna',
                      admin: {
                        hidden: true,
                      },
                    },
                    {
                      name: 'lng',
                      type: 'number',
                      label: 'Długość geograficzna',
                      admin: {
                        hidden: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
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
              ],
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
          ],
        },
        {
          label: 'Wymagania',
          fields: [
            {
              type: 'row',
              fields: [
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
              ],
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
          ],
        },
      ],
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
      admin: {
        position: 'sidebar',
      },
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
        position: 'sidebar',
        description: 'Organizacja odpowiedzialna za wydarzenie',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'admins',
      label: 'Utworzone przez',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Użytkownik który stworzył wydarzenie',
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
