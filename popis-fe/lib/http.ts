export const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

type HttpOptions = RequestInit & { json?: unknown };

export async function apiFetch<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${path}`.replace(/\/$/, ''), {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }

  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await response.json()) as T;
  }
  return undefined as unknown as T;
}

export function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {};

