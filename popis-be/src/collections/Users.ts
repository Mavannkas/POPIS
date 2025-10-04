import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Wolontariusz',
    plural: 'Wolontariusze',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'verified'],
    // Wolontariusze nie mają dostępu do admin panelu - używają tylko mobile app
    hidden: ({ user }: { user: any }) => {
      return true // Zawsze ukryte - wolontariusze używają tylko mobile app
    },
  },
  auth: true,
  fields: [
    // Volunteers only - no role field needed
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
    {
      name: 'birthDate',
      type: 'date',
      required: true,
      label: 'Data urodzenia',
      admin: {
        description: 'Wymagane do określenia czy osoba jest małoletnia',
      },
    },
    {
      name: 'isAgeIsVerified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Wiek zweryfikowany',
      admin: {
        description: 'Zatwierdzenie wieku',
        readOnly: true,
      },
    },
    {
      name: 'isMinor',
      type: 'checkbox',
      defaultValue: false,
      label: 'Małoletni',
      admin: {
        description: 'Automatycznie wyliczane na podstawie daty urodzenia',
        readOnly: true,
      },
    },
    {
      name: 'isAdult',
      type: 'checkbox',
      defaultValue: false,
      label: 'Pełnoletni',
      admin: {
        description: 'Automatycznie wyliczane - czy osoba jest pełnoletnia (>= 18 lat)',
        readOnly: true,
      },
    },
    // Student fields
    {
      name: 'isStudent',
      type: 'checkbox',
      defaultValue: false,
      label: 'Uczeń',
      admin: {
        description: 'Czy użytkownik jest uczniem szkoły',
      },
    },
    {
      name: 'school',
      type: 'relationship',
      relationTo: 'schools',
      label: 'Szkoła',
      admin: {
        description: 'Szkoła ucznia (wymagane jeśli isStudent=true)',
        condition: (data: any) => data.isStudent === true,
      },
    },
    // Volunteers are auto-verified
    // Volunteers don't need organization/coordinator fields
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
    // Anyone can create volunteer account (public registration)
    create: () => true,
    // Volunteers can read other volunteers (basic info only)
    read: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      // Volunteers can read other volunteers
      return true
    },
    // Volunteers can update their own profile
    update: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      // Volunteers can only update themselves
      return {
        id: { equals: user.id },
      }
    },
    // Volunteers can delete their own account
    delete: ({ req: { user } }: { req: { user: any } }) => {
      if (!user) return false
      // Volunteers can only delete themselves
      return {
        id: { equals: user.id },
      }
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }: { data: any; req: any; operation: string }) => {
        // Auto-calculate isMinor and isAdult based on birthDate
        if (data.birthDate) {
          const birthDate = new Date(data.birthDate)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          
          let actualAge = age
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            actualAge = age - 1
          }
          
          data.isMinor = actualAge < 18
          data.isAdult = actualAge >= 18
        }

        // Validate: if isStudent=true, school must be provided
        if (data.isStudent && !data.school) {
          throw new Error('Szkoła jest wymagana dla uczniów')
        }

        // Volunteers are auto-verified
        if (operation === 'create') {
          data.verified = true
        }

        return data
      },
    ],
  },
}
