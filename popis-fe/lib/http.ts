export const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

type HttpOptions = RequestInit & { json?: unknown; timeoutMs?: number };

function extractFriendlyErrorMessage(status: number, bodyText: string, bodyJson: any): string {
    const jsonMsg = bodyJson?.message || bodyJson?.error || bodyJson?.errors?.[0]?.message;
    const textMsg = bodyText && bodyText.length <= 300 ? bodyText : '';
    if (jsonMsg && typeof jsonMsg === 'string') return jsonMsg;
    if (textMsg) return textMsg;
    if (status >= 500) return 'Wystąpił błąd serwera. Spróbuj ponownie później.';
    if (status === 404) return 'Nie znaleziono zasobu.';
    if (status === 401) return 'Brak autoryzacji. Zaloguj się ponownie.';
    if (status === 400) return 'Nieprawidłowe dane.';
    return `Wystąpił błąd (HTTP ${status}).`;
}

export async function apiFetch<T>(path: string, options: HttpOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000);

    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`.replace(/\/$/, ''), {
            ...options,
            headers,
            credentials: (options.credentials as RequestCredentials) ?? 'include',
            body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
            signal: controller.signal,
        });
    } catch (e: any) {
        clearTimeout(timeout);
        if (e?.name === 'AbortError') {
            throw new Error('Przekroczono czas oczekiwania. Sprawdź połączenie.');
        }
        throw new Error('Błąd sieci. Sprawdź połączenie.');
    }

    clearTimeout(timeout);

    if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        let text = '';
        let json: any = null;
        try {
            if (ct.includes('application/json')) json = await response.json();
            else text = await response.text();
        } catch {
            // ignore
        }
        const message = extractFriendlyErrorMessage(response.status, text, json);
        throw new Error(message);
    }

    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
        const res = (await response.json()) as T;
        return res;
    }
    return undefined as unknown as T;
}

export function wait(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {};
