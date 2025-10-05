import { API_URL, apiFetch } from '../http'

export type ChatMessage = {
  id: string
  application: string
  content: string
  createdAt: string
  sender: any
  receiver: any
}

export async function getMessages(applicationId: string): Promise<ChatMessage[]> {
  if (!API_URL) return []
  const res = await apiFetch<{ success: boolean; messages: ChatMessage[] }>(`/api/chat/messages?applicationId=${encodeURIComponent(applicationId)}`, { method: 'GET', credentials: 'include' })
  return (res as any).messages || []
}

export async function sendMessage(applicationId: string, content: string) {
  if (!API_URL) return { success: true }
  return apiFetch(`/api/chat/messages`, {
    method: 'POST',
    credentials: 'include',
    json: { applicationId, content },
  })
}

// SSE hookup removed for now; mobile uses simple polling for reliability


