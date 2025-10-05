import type { Payload } from 'payload'

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding database...')

  try {
    // Clear existing data
    payload.logger.info('Clearing existing data...')

    const collections = [
      'certificates',
      'applications',
      'invitations',
      'events',
      'users',
      'admins',
      'schools',
      'media',
    ]

    for (const collection of collections) {
      try {
        const { docs } = await payload.find({
          collection: collection as any,
          limit: 1000,
        })

        if (docs.length > 0) {
          await Promise.all(
            docs.map((doc: any) =>
              payload.delete({
                collection: collection as any,
                id: doc.id,
              }),
            ),
          )
          payload.logger.info(`Cleared ${docs.length} documents from ${collection}`)
        }
      } catch (error) {
        payload.logger.error(`Error clearing ${collection}:`, error)
      }
    }

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

    // Additional Kraków schools for coordinators and students
    const moreSchools = await Promise.all([
      payload.create({
        collection: 'schools',
        data: {
          name: 'III Liceum Ogólnokształcące im. Jana Kochanowskiego',
          externalId: 'RSPO-009999',
          address: 'ul. Królewska 40',
          city: 'Kraków',
          postalCode: '30-045',
          type: 'liceum',
        },
      }),
      payload.create({
        collection: 'schools',
        data: {
          name: 'Zespół Szkół Technicznych nr 2',
          externalId: 'RSPO-009998',
          address: 'ul. Mogilska 86',
          city: 'Kraków',
          postalCode: '31-546',
          type: 'technikum',
        },
      }),
    ])

    // Seed Admins (Organizations and Coordinators)
    payload.logger.info('Seeding Admins...')
    const admins = await Promise.all([
      payload.create({
        collection: 'admins',
        data: {
          email: 'admin@popis.pl',
          password: 'zaq1@WSX',
          role: 'superadmin',
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+48 000 000 000',
          verified: true,
        },
      }),
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
          schoolAddress: 'ul. Marszałkowska 15, Warszawa',
        },
      }),
    ])

    // Additional coordinators for Kraków schools
    const krkCoordinators = await Promise.all([
      payload.create({
        collection: 'admins',
        data: {
          email: 'koord.krk1@szkola.edu.pl',
          password: 'Test123!@#',
          role: 'coordinator',
          firstName: 'Tomasz',
          lastName: 'Maj',
          phone: '+48 501 600 700',
          verified: true,
          schoolName: moreSchools[0].id,
          schoolAddress: 'ul. Królewska 40, 30-045 Kraków',
        },
      }),
      payload.create({
        collection: 'admins',
        data: {
          email: 'koord.krk2@zst2.edu.pl',
          password: 'Test123!@#',
          role: 'coordinator',
          firstName: 'Agnieszka',
          lastName: 'Bąk',
          phone: '+48 511 222 333',
          verified: true,
          schoolName: moreSchools[1].id,
          schoolAddress: 'ul. Mogilska 86, 31-546 Kraków',
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

    // Additional Kraków-focused users (students and adults)
    const moreUsers = await Promise.all([
      payload.create({
        collection: 'users',
        data: {
          email: 'pawel.krakowski@example.com',
          password: 'Test123!@#',
          firstName: 'Paweł',
          lastName: 'Krakowski',
          phone: '+48 700 111 222',
          birthDate: '2007-02-10',
          isStudent: true,
          school: moreSchools[0].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'ola.krakowska@example.com',
          password: 'Test123!@#',
          firstName: 'Aleksandra',
          lastName: 'Krakowska',
          phone: '+48 700 111 223',
          birthDate: '2008-12-01',
          isStudent: true,
          school: moreSchools[0].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'michal.nowy@example.com',
          password: 'Test123!@#',
          firstName: 'Michał',
          lastName: 'Nowy',
          phone: '+48 700 111 224',
          birthDate: '2006-06-06',
          isStudent: true,
          school: moreSchools[1].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'zofia.lato@example.com',
          password: 'Test123!@#',
          firstName: 'Zofia',
          lastName: 'Lato',
          phone: '+48 700 111 225',
          birthDate: '2005-09-18',
          isStudent: true,
          school: moreSchools[1].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'bartosz.krol@example.com',
          password: 'Test123!@#',
          firstName: 'Bartosz',
          lastName: 'Król',
          phone: '+48 700 111 226',
          birthDate: '1999-01-20',
          isStudent: false,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'julia.wawel@example.com',
          password: 'Test123!@#',
          firstName: 'Julia',
          lastName: 'Wawel',
          phone: '+48 700 111 227',
          birthDate: '2004-04-04',
          isStudent: true,
          school: schools[2].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'krystian.bronowice@example.com',
          password: 'Test123!@#',
          firstName: 'Krystian',
          lastName: 'Bronowice',
          phone: '+48 700 111 228',
          birthDate: '2006-10-10',
          isStudent: true,
          school: moreSchools[0].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'nina.nowa@example.com',
          password: 'Test123!@#',
          firstName: 'Nina',
          lastName: 'Nowa',
          phone: '+48 700 111 229',
          birthDate: '1998-03-12',
          isStudent: false,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'adam.kazimierz@example.com',
          password: 'Test123!@#',
          firstName: 'Adam',
          lastName: 'Kazimierz',
          phone: '+48 700 111 230',
          birthDate: '2005-05-30',
          isStudent: true,
          school: schools[2].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'ewa.debniki@example.com',
          password: 'Test123!@#',
          firstName: 'Ewa',
          lastName: 'Dębniki',
          phone: '+48 700 111 231',
          birthDate: '2007-07-07',
          isStudent: true,
          school: moreSchools[1].id,
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          email: 'filip.nowohucki@example.com',
          password: 'Test123!@#',
          firstName: 'Filip',
          lastName: 'Nowohucki',
          phone: '+48 700 111 232',
          birthDate: '2006-08-22',
          isStudent: true,
          school: moreSchools[1].id,
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
          organization: admins[1].id,
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
          createdBy: admins[1].id,
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
          organization: admins[2].id,
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
          createdBy: admins[2].id,
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
          organization: admins[1].id,
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
          createdBy: admins[1].id,
        },
      }),
    ])

    // Additional Kraków public events (various categories)
    const moreKrakowEvents = await Promise.all([
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Sprzątanie Bulwarów Wiślanych',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Dołącz do akcji sprzątania bulwarów nad Wisłą.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'environment',
          size: 'large',
          location: { address: 'Bulwary Wiślane', city: 'Kraków', lat: 50.051, lng: 19.945 },
          startDate: new Date('2025-11-22T10:00:00').toISOString(),
          endDate: new Date('2025-11-22T14:00:00').toISOString(),
          duration: 4,
          minAge: 15,
          maxVolunteers: 100,
          requirements: 'Rękawiczki i wygodne buty',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Zbiórka żywności dla potrzebujących',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Wsparcie przy zbiórce i sortowaniu żywności.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'social',
          size: 'medium',
          location: { address: 'ul. Dietla 50', city: 'Kraków', lat: 50.056, lng: 19.944 },
          startDate: new Date('2025-11-28T09:00:00').toISOString(),
          endDate: new Date('2025-11-28T15:00:00').toISOString(),
          duration: 6,
          minAge: 16,
          maxVolunteers: 40,
          requirements: 'Chęć pomocy i punktualność',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Maraton pisania listów',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Akcja społeczna – piszemy listy wsparcia.' } ] } ] } },
          organization: admins[1].id,
          eventType: 'public',
          category: 'culture',
          size: 'small',
          location: { address: 'ul. Szewska 2', city: 'Kraków', lat: 50.062, lng: 19.936 },
          startDate: new Date('2025-12-02T12:00:00').toISOString(),
          endDate: new Date('2025-12-02T16:00:00').toISOString(),
          duration: 4,
          minAge: 14,
          maxVolunteers: 20,
          requirements: 'Dokładność i empatia',
          status: 'published',
          createdBy: admins[1].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Bieg charytatywny – obsługa punktów',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Pomoc przy punktach wodnych i logistyce.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'sport',
          size: 'large',
          location: { address: 'Błonia Krakowskie', city: 'Kraków', lat: 50.062, lng: 19.914 },
          startDate: new Date('2025-12-06T08:00:00').toISOString(),
          endDate: new Date('2025-12-06T14:00:00').toISOString(),
          duration: 6,
          minAge: 16,
          maxVolunteers: 80,
          requirements: 'Zaangażowanie i komunikatywność',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Warsztaty programowania dla młodzieży',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Prowadzenie warsztatów z podstaw programowania.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'education',
          size: 'medium',
          location: { address: 'ul. Nawojki 11', city: 'Kraków', lat: 50.067, lng: 19.906 },
          startDate: new Date('2025-12-10T10:00:00').toISOString(),
          endDate: new Date('2025-12-10T14:00:00').toISOString(),
          duration: 4,
          minAge: 15,
          maxVolunteers: 25,
          requirements: 'Podstawy JS/HTML mile widziane',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Magazyn darów – sortowanie',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Pomoc w sortowaniu i wydawaniu darów.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'social',
          size: 'medium',
          location: { address: 'ul. Kamienna 19', city: 'Kraków', lat: 50.079, lng: 19.945 },
          startDate: new Date('2025-12-12T09:00:00').toISOString(),
          endDate: new Date('2025-12-12T15:00:00').toISOString(),
          duration: 6,
          minAge: 16,
          maxVolunteers: 30,
          requirements: 'Sprawność fizyczna',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Warsztaty pierwszej pomocy',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Wsparcie organizacyjne w warsztatach.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'health',
          size: 'small',
          location: { address: 'ul. Kopernika 7', city: 'Kraków', lat: 50.061, lng: 19.946 },
          startDate: new Date('2025-12-15T10:00:00').toISOString(),
          endDate: new Date('2025-12-15T13:00:00').toISOString(),
          duration: 3,
          minAge: 16,
          maxVolunteers: 15,
          requirements: 'Komunikatywność',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Kiermasz świąteczny – wsparcie stoisk',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Obsługa i dekoracja stoisk.' } ] } ] } },
          organization: admins[1].id,
          eventType: 'public',
          category: 'culture',
          size: 'medium',
          location: { address: 'Rynek Główny', city: 'Kraków', lat: 50.061, lng: 19.937 },
          startDate: new Date('2025-12-18T11:00:00').toISOString(),
          endDate: new Date('2025-12-18T17:00:00').toISOString(),
          duration: 6,
          minAge: 15,
          maxVolunteers: 35,
          requirements: 'Uśmiech i chęć do pracy',
          status: 'published',
          createdBy: admins[1].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Wyprowadzanie psów w schronisku',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Pomoc w schronisku – spacery i opieka.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'animals',
          size: 'small',
          location: { address: 'ul. Rybna 3', city: 'Kraków', lat: 50.081, lng: 19.895 },
          startDate: new Date('2025-12-20T09:00:00').toISOString(),
          endDate: new Date('2025-12-20T12:00:00').toISOString(),
          duration: 3,
          minAge: 16,
          maxVolunteers: 12,
          requirements: 'Miłość do zwierząt',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Malowanie świetlicy środowiskowej',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Odświeżamy sale dla dzieci i młodzieży.' } ] } ] } },
          organization: admins[1].id,
          eventType: 'public',
          category: 'social',
          size: 'medium',
          location: { address: 'ul. Lea 20', city: 'Kraków', lat: 50.072, lng: 19.915 },
          startDate: new Date('2026-01-05T10:00:00').toISOString(),
          endDate: new Date('2026-01-05T16:00:00').toISOString(),
          duration: 6,
          minAge: 16,
          maxVolunteers: 25,
          requirements: 'Ubranie robocze',
          status: 'published',
          createdBy: admins[1].id,
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Turniej dla dzieci – sędziowanie i pomoc',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Wsparcie przy turnieju sportowym.' } ] } ] } },
          organization: admins[2].id,
          eventType: 'public',
          category: 'sport',
          size: 'large',
          location: { address: 'ul. Reymonta 22', city: 'Kraków', lat: 50.068, lng: 19.912 },
          startDate: new Date('2026-01-12T08:00:00').toISOString(),
          endDate: new Date('2026-01-12T14:00:00').toISOString(),
          duration: 6,
          minAge: 16,
          maxVolunteers: 60,
          requirements: 'Odpowiedzialność',
          status: 'published',
          createdBy: admins[2].id,
        },
      }),
    ])

    // Kraków school events organized by coordinators (with participants)
    const krkSchoolEvents = await Promise.all([
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Szkolny wolontariat – wizyta w domu seniora',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Odwiedziny i rozmowy z seniorami.' } ] } ] } },
          organization: admins[2].id,
          createdBy: krkCoordinators[0].id,
          eventType: 'school',
          targetSchool: moreSchools[0].id,
          category: 'social',
          size: 'small',
          location: { address: 'ul. Senioralna 5', city: 'Kraków', lat: 50.04, lng: 19.95 },
          startDate: new Date('2025-12-08T10:00:00').toISOString(),
          endDate: new Date('2025-12-08T13:00:00').toISOString(),
          duration: 3,
          minAge: 15,
          maxVolunteers: 10,
          requirements: 'Empatia i kultura osobista',
          status: 'published',
          participants: [
            { user: moreUsers[0].id, task: 'Rozmowy', isAccepted: true },
            { user: moreUsers[1].id, task: 'Czytanie książek', isAccepted: true },
            { user: moreUsers[6].id, task: 'Pomoc techniczna', isAccepted: true },
          ],
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Szkolny klub ekologiczny – nasadzenia drzew',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Wspólne sadzenie drzew na terenie szkoły.' } ] } ] } },
          organization: admins[2].id,
          createdBy: krkCoordinators[1].id,
          eventType: 'school',
          targetSchool: moreSchools[1].id,
          category: 'environment',
          size: 'medium',
          location: { address: 'ul. Mogilska 86', city: 'Kraków', lat: 50.07, lng: 19.98 },
          startDate: new Date('2025-12-11T09:00:00').toISOString(),
          endDate: new Date('2025-12-11T12:00:00').toISOString(),
          duration: 3,
          minAge: 14,
          maxVolunteers: 25,
          requirements: 'Rękawiczki',
          status: 'published',
          participants: [
            { user: moreUsers[2].id, task: 'Kopanie dołków', isAccepted: true },
            { user: moreUsers[3].id, task: 'Sadzenie', isAccepted: true },
            { user: moreUsers[9].id, task: 'Podlewanie', isAccepted: true },
          ],
        },
      }),
      payload.create({
        collection: 'events',
        data: {
          title: 'Kraków: Szkolny kiermasz charytatywny',
          description: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [ { type: 'paragraph', version: 1, children: [ { type: 'text', text: 'Organizacja kiermaszu i sprzedaż wypieków.' } ] } ] } },
          organization: admins[2].id,
          createdBy: krkCoordinators[0].id,
          eventType: 'school',
          targetSchool: moreSchools[0].id,
          category: 'culture',
          size: 'medium',
          location: { address: 'ul. Królewska 40', city: 'Kraków', lat: 50.067, lng: 19.926 },
          startDate: new Date('2025-12-19T11:00:00').toISOString(),
          endDate: new Date('2025-12-19T16:00:00').toISOString(),
          duration: 5,
          minAge: 14,
          maxVolunteers: 30,
          requirements: 'Komunikacja i współpraca',
          status: 'published',
          participants: [
            { user: moreUsers[5].id, task: 'Stoisko z książkami', isAccepted: true },
            { user: moreUsers[6].id, task: 'Kasa', isAccepted: true },
            { user: users[0].id, task: 'Promocja wydarzenia', isAccepted: true },
          ],
        },
      }),
    ])

    const allEvents = [...events, ...moreKrakowEvents, ...krkSchoolEvents]

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
          status: 'completed',
          message: 'Chętnie wezmę udział w akcji sprzątania!',
          hoursWorked: 4,
          appliedAt: new Date('2025-10-05').toISOString(),
          completedAt: new Date('2025-11-20').toISOString(),
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

    // Extra applications for Kraków events
    await Promise.all([
      payload.create({
        collection: 'applications',
        data: {
          event: moreKrakowEvents[0].id,
          volunteer: moreUsers[4].id,
          status: 'accepted',
          message: 'Chętnie pomogę nad Wisłą!',
          hoursWorked: 0,
        },
      }),
      payload.create({
        collection: 'applications',
        data: {
          event: moreKrakowEvents[1].id,
          volunteer: moreUsers[6].id,
          status: 'pending',
          message: 'Mam czas w piątek.',
        },
      }),
      payload.create({
        collection: 'applications',
        data: {
          event: moreKrakowEvents[2].id,
          volunteer: moreUsers[7].id,
          status: 'accepted',
          message: 'Chcę pomóc przy maratonie listów.',
        },
      }),
      payload.create({
        collection: 'applications',
        data: {
          event: moreKrakowEvents[3].id,
          volunteer: moreUsers[8].id,
          status: 'completed',
          message: 'Obsługa punktu na Błoniach zakończona.',
          hoursWorked: 6,
          completedAt: new Date('2025-12-06T15:00:00').toISOString(),
        },
      }),
      payload.create({
        collection: 'applications',
        data: {
          event: krkSchoolEvents[0].id,
          volunteer: moreUsers[0].id,
          status: 'accepted',
          message: 'Jestem w grupie szkolnej.',
        },
      }),
    ])

    // Group applications from coordinators (link school event -> public event)
    const groupApp1 = await payload.create({
      collection: 'group_applications',
      data: {
        targetEvent: moreKrakowEvents[0].id, // Bulwary Wiślane (public)
        sourceSchoolEvent: krkSchoolEvents[0].id, // wizyta w domu seniora (school)
        coordinator: krkCoordinators[0].id,
        message: 'Chcemy dołączyć grupą uczniów z III LO.',
        status: 'pending',
      },
    })

    const groupApp2 = await payload.create({
      collection: 'group_applications',
      data: {
        targetEvent: moreKrakowEvents[4].id, // warsztaty programowania (public)
        sourceSchoolEvent: krkSchoolEvents[1].id, // nasadzenia drzew (school)
        coordinator: krkCoordinators[1].id,
        message: 'Prosimy o miejsca dla naszej klasy.',
        status: 'pending',
      },
    })

    // Manually create applications for eligible participants from school events (avoid relying on hooks)
    const schoolParticipants1 = [moreUsers[0].id, moreUsers[1].id, moreUsers[6].id]
    const schoolParticipants2 = [moreUsers[2].id, moreUsers[3].id, moreUsers[9].id]

    await Promise.all([
      ...schoolParticipants1.map((uid) =>
        payload.create({
          collection: 'applications',
          data: {
            event: moreKrakowEvents[0].id,
            volunteer: uid,
            message: 'Zgłoszenie grupowe (ręcznie utworzone w seedzie) – Bulwary',
            status: 'accepted',
            groupApplication: groupApp1.id,
          },
        }),
      ),
      ...schoolParticipants2.map((uid) =>
        payload.create({
          collection: 'applications',
          data: {
            event: moreKrakowEvents[4].id,
            volunteer: uid,
            message: 'Zgłoszenie grupowe (ręcznie utworzone w seedzie) – Warsztaty',
            status: 'accepted',
            groupApplication: groupApp2.id,
          },
        }),
      ),
    ])

    // Seed Invitations
    payload.logger.info('Seeding Invitations...')
    await Promise.all([
      payload.create({
        collection: 'invitations',
        data: {
          event: events[0].id,
          volunteer: users[2].id,
          invitedBy: admins[1].id,
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
          invitedBy: admins[2].id,
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
          invitedBy: admins[1].id,
          status: 'declined',
          message: 'Mamy wrażenie, że masz świetne podejście do dzieci!',
          invitedAt: new Date('2025-10-01').toISOString(),
          respondedAt: new Date('2025-10-02').toISOString(),
        },
      }),
    ])

    // Seed Certificates
    // Note: Certificates for applications with status 'completed' are auto-created by hook
    // We only manually create certificate for application[0] which has status 'accepted'
    payload.logger.info('Seeding Certificates...')
    await payload.create({
      collection: 'certificates',
      data: {
        application: applications[0].id,
        volunteer: users[0].id,
        event: events[0].id,
        organization: admins[1].id,
        hoursWorked: 6,
        issuedBy: admins[1].id,
        status: 'issued',
        certificateNumber: 'CERT-2025-001',
        issueDate: new Date('2025-11-16').toISOString(),
        notes: 'Wolontariusz bardzo zaangażowany i pomocny',
      },
    })

    payload.logger.info('✅ Database seeded successfully!')
  } catch (error) {
    payload.logger.error('Error seeding database:')
    payload.logger.error(error)
    throw error
  }
}
