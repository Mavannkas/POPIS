import { apiFetch } from './http';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  eventType: 'public' | 'school';
  location: {
    address: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  startDate: string;
  endDate?: string;
  duration: number;
  minAge: number;
  maxVolunteers?: number;
  requirements?: string;
  additionalInfo?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  organization: any;
  image?: any;
}

export interface EventsResponse {
  success: boolean;
  events: Event[];
  totalDocs: number;
  page: number;
}

export interface EventFilters {
  category?: string;
  city?: string;
  minAge?: number;
  search?: string;
  eventType?: 'public' | 'school';
}

// Mock data for development - replace with real API later
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Warsztaty programowania dla młodzieży',
    description: 'Nauka podstaw programowania w JavaScript',
    category: 'education',
    size: 'medium',
    eventType: 'public',
    location: {
      address: 'ul. Floriańska 18',
      city: 'Kraków',
      lat: 50.0647,
      lng: 19.9450,
    },
    startDate: '2025-10-15T10:00:00',
    endDate: '2025-10-15T14:00:00',
    duration: 4,
    minAge: 13,
    maxVolunteers: 20,
    status: 'published',
    organization: null,
  },
  {
    id: '2',
    title: 'Sprzątanie Planty',
    description: 'Wspólne sprzątanie parków Planty wokół Starego Miasta',
    category: 'environment',
    size: 'large',
    eventType: 'public',
    location: {
      address: 'Planty, Stare Miasto',
      city: 'Kraków',
      lat: 50.0614,
      lng: 19.9366,
    },
    startDate: '2025-10-20T09:00:00',
    endDate: '2025-10-20T13:00:00',
    duration: 4,
    minAge: 16,
    maxVolunteers: 50,
    status: 'published',
    organization: null,
  },
  {
    id: '3',
    title: 'Pomoc w schronisku dla zwierząt',
    description: 'Opieka nad zwierzętami w schronisku na Rusi',
    category: 'animals',
    size: 'small',
    eventType: 'public',
    location: {
      address: 'ul. Rybałtowska 6, Ruś Szkolna',
      city: 'Kraków',
      lat: 50.0884,
      lng: 19.9667,
    },
    startDate: '2025-10-18T14:00:00',
    endDate: '2025-10-18T18:00:00',
    duration: 4,
    minAge: 18,
    maxVolunteers: 10,
    status: 'published',
    organization: null,
  },
  {
    id: '4',
    title: 'Warsztaty teatralne w Starym Teatrze',
    description: 'Pomoc w organizacji warsztatów teatralnych dla dzieci',
    category: 'culture',
    size: 'medium',
    eventType: 'public',
    location: {
      address: 'Stary Teatr, ul. Jagiellońska 1',
      city: 'Kraków',
      lat: 50.0627,
      lng: 19.9405,
    },
    startDate: '2025-10-25T15:00:00',
    endDate: '2025-10-25T19:00:00',
    duration: 4,
    minAge: 15,
    maxVolunteers: 15,
    status: 'published',
    organization: null,
  },
  {
    id: '5',
    title: 'Bieg charytatywny - Kraków Błonia',
    description: 'Pomoc w organizacji biegu charytatywnego na Błoniach',
    category: 'sport',
    size: 'large',
    eventType: 'public',
    location: {
      address: 'Błonia Krakowskie',
      city: 'Kraków',
      lat: 50.0577,
      lng: 19.9156,
    },
    startDate: '2025-10-22T08:00:00',
    endDate: '2025-10-22T14:00:00',
    duration: 6,
    minAge: 16,
    maxVolunteers: 30,
    status: 'published',
    organization: null,
  },
];

export async function getAvailableEvents(filters?: EventFilters): Promise<EventsResponse> {
  // TODO: Replace mock data with real API call
  // const params = new URLSearchParams();
  // if (filters?.category) params.append('category', filters.category);
  // if (filters?.city) params.append('city', filters.city);
  // if (filters?.minAge) params.append('minAge', filters.minAge.toString());
  // if (filters?.search) params.append('search', filters.search);
  // if (filters?.eventType) params.append('eventType', filters.eventType);
  // const queryString = params.toString();
  // const path = `/api/events/available${queryString ? `?${queryString}` : ''}`;
  // return apiFetch<EventsResponse>(path);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Apply filters to mock data
  let filteredEvents = [...MOCK_EVENTS];

  if (filters?.category) {
    filteredEvents = filteredEvents.filter(e => e.category === filters.category);
  }
  if (filters?.city) {
    filteredEvents = filteredEvents.filter(e => 
      e.location.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  if (filters?.minAge) {
    filteredEvents = filteredEvents.filter(e => e.minAge <= filters.minAge!);
  }
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredEvents = filteredEvents.filter(e => 
      e.title.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower)
    );
  }
  if (filters?.eventType) {
    filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType);
  }

  return {
    success: true,
    events: filteredEvents,
    totalDocs: filteredEvents.length,
    page: 1,
  };
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    education: 'Edukacja',
    environment: 'Środowisko',
    social: 'Pomoc społeczna',
    health: 'Zdrowie',
    animals: 'Zwierzęta',
    culture: 'Kultura',
    sport: 'Sport',
    other: 'Inne',
  };
  return labels[category] || category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    education: '#3b82f6',
    environment: '#10b981',
    social: '#f59e0b',
    health: '#ef4444',
    animals: '#8b5cf6',
    culture: '#ec4899',
    sport: '#000000',
    other: '#6b7280',
  };
  return colors[category] || '#6b7280';
}

export function getCategoryEmoji(category: string): string {
  console.log('category', category);

  const emojis: Record<string, string> = {
    education: '📚',
    environment: '🌱',
    social: '🤝',
    health: '❤️',
    animals: '🐾',
    culture: '🎨',
    sport: '🏃',
    other: '📌',
  };
  return emojis[category] || '📌';
}

