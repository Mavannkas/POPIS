import { API_URL, apiFetch } from './http';

export type School = {
  id: string;
  name: string;
};

export async function getSchools(): Promise<School[]> {
  if (!API_URL) {
    // Mock data gdy nie ma API
    return [
      { id: '1', name: 'Szkoła Podstawowa nr 1' },
      { id: '2', name: 'Liceum Ogólnokształcące' },
      { id: '3', name: 'Technikum Informatyczne' },
    ];
  }
  // TODO: Dodaj prawdziwe API endpoint
  return apiFetch<School[]>('/schools', { method: 'GET' });
}

