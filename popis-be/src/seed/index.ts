import type { Payload } from 'payload'

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding database...')

  try {
    // Clear existing data
    payload.logger.info('Clearing existing data...')

    // Seed Schools
    payload.logger.info('Seeding Schools...')
    const schools = await Promise.all([
      payload.create({
        collection: 'schools',
        data: {
          name: 'I Liceum Ogólnokształcące im. Juliusza Słowackiego',
          externalId: 'RSPO-001234',
          address: 'ul. Marszałkowska 15',
          city: 'Warszawa',
          postalCode: '00-001',
          type: 'liceum',
        },
      }),
      payload.create({
        collection: 'schools',
        data: {
          name: 'Technikum Informatyczne nr 5',
          externalId: 'RSPO-005678',
          address: 'ul. Piotrkowska 100',
          city: 'Łódź',
          postalCode: '90-001',
          type: 'technikum',
        },
      }),
      payload.create({
        collection: 'schools',
        data: {
          name: 'II Liceum Ogólnokształcące im. Mikołaja Kopernika',
          externalId: 'RSPO-009012',
          address: 'ul. Floriańska 25',
          city: 'Kraków',
          postalCode: '31-001',
          type: 'liceum',
        },
      }),
    ])

    // Seed Admins (Organizations and Coordinators)
    payload.logger.info('Seeding Admins...')
    const admins = await Promise.all([
      payload.create({
        collection: 'admins',
        data: {
          email: 'kontakt@fundacjapomocy.pl',
          password: 'Test123!@#',
          role: 'organization',
          firstName: 'Anna',
          lastName: 'Kowalska',
          phone: '+48 123 456 789',
          verified: true,
          organizationName: 'Fundacja Pomocy Potrzebującym',
          organizationDescription: 'Fundacja pomagająca osobom w trudnej sytuacji życiowej',
          nip: '1234567890',
          address: {
            street: 'ul. Solidarności 10',
            city: 'Warszawa',
            postalCode: '00-002',
          },
        },
      }),
      payload.create({
        collection: 'admins',
        data: {
          email: 'kontakt@zielonaszkola.pl',
          password: 'Test123!@#',
          role: 'organization',
          firstName: 'Piotr',
          lastName: 'Nowak',
          phone: '+48 234 567 890',
          verified: true,
          organizationName: 'Stowarzyszenie Zielona Szkoła',
          organizationDescription: 'Promujemy edukację ekologiczną wśród młodzieży',
          nip: '9876543210',
          address: {
            street: 'ul. Ekologiczna 5',
            city: 'Kraków',
            postalCode: '31-002',
          },
        },
      }),
      payload.create({
        collection: 'admins',
        data: {
          email: 'koordynator@slowacki.edu.pl',
          password: 'Test123!@#',
          role: 'coordinator',
          firstName: 'Maria',
          lastName: 'Wiśniewska',
          phone: '+48 345 678 901',
          verified: true,
          schoolName: 'I Liceum Ogólnokształcące im. Juliusza Słowackiego',
          schoolAddress: 'ul. Marszałkowska 15, Warszawa',
        },
      }),
    ])

    // Seed Users (Volunteers)
    payload.logger.info('Seeding Users (Volunteers)...')
    const users = await Promise.all([
      payload.create({
        collection: 'users',
        data: {
          email: 'jan.kowalski@example.com',
          password: 'Test123!@#',
          firstName: 'Jan',
          lastName: 'Kowalski',
          phone: '+48 456 789 012',
          birthDate: '2006-03-15',
          isStudent: true,
          school: schools[0].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'anna.nowak@example.com',
          password: 'Test123!@#',
          firstName: 'Anna',
          lastName: 'Nowak',
          phone: '+48 567 890 123',
          birthDate: '1995-07-22',
          isStudent: false,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'kasia.wisniewski@example.com',
          password: 'Test123!@#',
          firstName: 'Katarzyna',
          lastName: 'Wiśniewska',
          phone: '+48 678 901 234',
          birthDate: '2007-11-08',
          isStudent: true,
          school: schools[1].id,
        },
      }),
    ])

    // Seed Events
    payload.logger.info('Seeding Events...')
    const events = await Promise.all([
      payload.create({
        collection: 'events',
        data: {
          title: 'Pomoc w schronisku dla zwierząt',
          description: {
            root: {
              type: 'root',
              version: 1,
              direction: 'ltr',
              format: '',
              indent: 0,
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      text: 'Zapraszamy do pomocy w lokalnym schronisku dla zwierząt. Będziemy wspólnie sprzątać boksy, wyprowadzać psy na spacery oraz bawić się z kotami.',
                    },
                  ],
                },
              ],
            },
          },
          organization: admins[0].id,
          eventType: 'public',
          category: 'animals',
          size: 'medium',
          location: {
            address: 'ul. Adopcyjna 12',
            city: 'Warszawa',
            lat: 52.2297,
            lng: 21.0122,
          },
          startDate: new Date('2025-11-15T09:00:00').toISOString(),
          endDate: new Date('2025-11-15T15:00:00').toISOString(),
          duration: 6,
          minAge: 16,
          maxVolunteers: 20,
          requirements: 'Nie wymagamy doświadczenia, tylko chęci do pracy i miłość do zwierząt',
          status: 'published',
          createdBy: admins[0].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Sprzątanie parku miejskiego',
          description: {
            root: {
              type: 'root',
              version: 1,
              direction: 'ltr',
              format: '',
              indent: 0,
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      text: 'Akcja sprzątania Parku Łazienkowskiego. Wspólnie zadbamy o czystość naszego miasta i środowisko naturalne.',
                    },
                  ],
                },
              ],
            },
          },
          organization: admins[1].id,
          eventType: 'school',
          targetSchool: schools[0].id,
          category: 'environment',
          size: 'large',
          location: {
            address: 'Park Łazienkowski',
            city: 'Warszawa',
            lat: 52.2148,
            lng: 21.0352,
          },
          startDate: new Date('2025-11-20T10:00:00').toISOString(),
          endDate: new Date('2025-11-20T14:00:00').toISOString(),
          duration: 4,
          minAge: 15,
          maxVolunteers: 50,
          requirements: 'Przynieś własne rękawiczki i workii na śmieci',
          additionalInfo: 'Po akcji organizujemy wspólne ognisko',
          status: 'published',
          createdBy: admins[1].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Pomoc w organizacji festynu szkolnego',
          description: {
            root: {
              type: 'root',
              version: 1,
              direction: 'ltr',
              format: '',
              indent: 0,
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      text: 'Szukamy wolontariuszy do pomocy w organizacji corocznego festynu szkolnego. Będziecie pomagać przy stoiskach, prowadzeniu gier i zabaw dla dzieci.',
                    },
                  ],
                },
              ],
            },
          },
          organization: admins[0].id,
          eventType: 'public',
          category: 'culture',
          size: 'small',
          location: {
            address: 'ul. Rynek 1',
            city: 'Kraków',
            lat: 50.0647,
            lng: 19.945,
          },
          startDate: new Date('2025-12-05T12:00:00').toISOString(),
          endDate: new Date('2025-12-05T18:00:00').toISOString(),
          duration: 6,
          minAge: 14,
          maxVolunteers: 15,
          requirements: 'Komunikatywność i chęć pracy z dziećmi',
          status: 'published',
          createdBy: admins[0].id,
        },
      }),
    ])

    // Seed Applications
    payload.logger.info('Seeding Applications...')
    const applications = await Promise.all([
      payload.create({
        collection: 'applications',
        data: {
          event: events[0].id,
          volunteer: users[0].id,
          status: 'accepted',
          message: 'Bardzo chcę pomóc zwierzętom! Mam doświadczenie z psami.',
          hoursWorked: 6,
          appliedAt: new Date('2025-10-01').toISOString(),
        },
      }),
      payload.create({
        collection: 'applications',
        data: {
          event: events[1].id,
          volunteer: users[1].id,
          status: 'pending',
          message: 'Chętnie wezmę udział w akcji sprzątania!',
          appliedAt: new Date('2025-10-05').toISOString(),
        },
      }),
      payload.create({
        collection: 'applications',
        data: {
          event: events[2].id,
          volunteer: users[2].id,
          status: 'completed',
          message: 'Mam doświadczenie w pracy z dziećmi z kolonii letnich.',
          hoursWorked: 6,
          appliedAt: new Date('2025-09-20').toISOString(),
          completedAt: new Date('2025-12-05').toISOString(),
        },
      }),
    ])

    // Seed Invitations
    payload.logger.info('Seeding Invitations...')
    await Promise.all([
      payload.create({
        collection: 'invitations',
        data: {
          event: events[0].id,
          volunteer: users[2].id,
          invitedBy: admins[0].id,
          status: 'pending',
          message:
            'Szukamy osób z doświadczeniem w pracy ze zwierzętami. Sądzimy, że będziesz idealną osobą!',
          invitedAt: new Date('2025-10-10').toISOString(),
        },
      }),
      payload.create({
        collection: 'invitations',
        data: {
          event: events[1].id,
          volunteer: users[0].id,
          invitedBy: admins[1].id,
          status: 'accepted',
          message: 'Zapraszamy Cię do udziału w akcji sprzątania parku!',
          invitedAt: new Date('2025-10-08').toISOString(),
          respondedAt: new Date('2025-10-09').toISOString(),
        },
      }),
      payload.create({
        collection: 'invitations',
        data: {
          event: events[2].id,
          volunteer: users[1].id,
          invitedBy: admins[0].id,
          status: 'declined',
          message: 'Mamy wrażenie, że masz świetne podejście do dzieci!',
          invitedAt: new Date('2025-10-01').toISOString(),
          respondedAt: new Date('2025-10-02').toISOString(),
        },
      }),
    ])

    // Seed Certificates
    payload.logger.info('Seeding Certificates...')
    await Promise.all([
      payload.create({
        collection: 'certificates',
        data: {
          application: applications[0].id,
          volunteer: users[0].id,
          event: events[0].id,
          organization: admins[0].id,
          hoursWorked: 6,
          issuedBy: admins[0].id,
          status: 'issued',
          certificateNumber: 'CERT-2025-001',
          issueDate: new Date('2025-11-16').toISOString(),
          notes: 'Wolontariusz bardzo zaangażowany i pomocny',
        },
      }),
      payload.create({
        collection: 'certificates',
        data: {
          application: applications[2].id,
          volunteer: users[2].id,
          event: events[2].id,
          organization: admins[0].id,
          hoursWorked: 6,
          issuedBy: admins[0].id,
          approvedBy: admins[2].id,
          status: 'issued',
          certificateNumber: 'CERT-2025-002',
          issueDate: new Date('2025-12-06').toISOString(),
          notes: 'Świetna praca z dziećmi podczas festynu',
        },
      }),
      payload.create({
        collection: 'certificates',
        data: {
          application: applications[2].id,
          volunteer: users[2].id,
          event: events[2].id,
          organization: admins[0].id,
          hoursWorked: 6,
          status: 'pending',
          certificateNumber: 'CERT-2025-003',
          issueDate: new Date('2025-12-07').toISOString(),
        },
      }),
    ])

    payload.logger.info('✅ Database seeded successfully!')
  } catch (error) {
    payload.logger.error('Error seeding database:')
    payload.logger.error(error)
    throw error
  }
}
