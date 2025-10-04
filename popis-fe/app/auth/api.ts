import type { AuthUser, SignInPayload, SignUpPayload } from './types';
import { API_URL, apiFetch, wait } from '@/app/services/http';

// Single integration surface. If API_URL is not set, we stub locally in-place.

export async function signIn(payload: SignInPayload): Promise<AuthUser> {
  if (!API_URL) {
    await wait();
    return {
      id: 'stub_' + Math.random().toString(36).slice(2),
      email: payload.email,
    };
  }
  return apiFetch<AuthUser>('/auth/sign-in', { method: 'POST', json: payload });
}

export async function signUp(payload: SignUpPayload): Promise<AuthUser> {
  if (!API_URL) {
    await wait();
    return {
      id: 'stub_' + Math.random().toString(36).slice(2),
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
  return apiFetch<AuthUser>('/auth/sign-up', { method: 'POST', json: payload });
}

export async function me(): Promise<AuthUser | null> {
  if (!API_URL) {
    await wait(200);
    // Simulate a logged-in user in stub mode
    return {
      id: 'stub_user',
      email: 'user@example.com',
    };
  }
  return apiFetch<AuthUser | null>('/auth/me', { method: 'GET' });
}

export async function signOut(): Promise<void> {
  if (!API_URL) return; // nothing to do in stub
  await apiFetch<void>('/auth/sign-out', { method: 'POST' });
}

