import { apiFetch } from '../http'

export type AppNotification = {
  id: string
  type: 'approval_decision' | 'event_invitation' | 'chat_message'
  event?: any
  invitation?: any
  application?: any
  decision?: 'accepted' | 'rejected'
  message?: string
  isRead: boolean
  actionRequired: boolean
  createdAt: string
}

export async function getMyNotifications(opts?: { unread?: boolean }) {
  const params = new URLSearchParams()
  if (opts?.unread) params.set('unread', 'true')
  return apiFetch<{ success: boolean; notifications: AppNotification[] }>(
    `/api/my/notifications?${params.toString()}`,
    { method: 'GET', credentials: 'include' },
  )
}

export async function markNotificationRead(id: string, isRead = true) {
  return apiFetch<{ success: boolean }>(`/api/my/notifications/${id}`,
    { method: 'PATCH', credentials: 'include', json: { isRead } })
}

export async function getUnreadCount() {
  const res = await getMyNotifications({ unread: true })
  const list = (res as any)?.notifications || []
  return list.length as number
}


