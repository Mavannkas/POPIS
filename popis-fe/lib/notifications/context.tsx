import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getUnreadCount } from '../services/notifications'
import { useAuth } from '@/lib/auth/context'

type Ctx = {
  unread: number
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<Ctx | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useAuth()

  const refresh = useCallback(async () => {
    try {
      // Skip when not logged in
      if (!user) {
        setUnread(0)
        return
      }
      const count = await getUnreadCount()
      setUnread(count)
    } catch (e) {
      // silent
    }
  }, [user])

  useEffect(() => {
    // Start or stop based on auth state
    if (user) {
      refresh()
      pollRef.current = setInterval(refresh, 45000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refresh, user])

  return (
    <NotificationsContext.Provider value={{ unread, refresh }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsBadge() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotificationsBadge requires NotificationsProvider')
  return ctx
}


