import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getUnreadCount } from '../services/notifications'
import { useAuth } from '@/lib/auth/context'
import { Snackbar } from 'react-native-paper'

type Ctx = {
  unread: number
  refresh: () => Promise<void>
  showToast: (message: string) => void
}

const NotificationsContext = createContext<Ctx | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useAuth()
  const [toast, setToast] = useState<{ visible: boolean, message: string }>({ visible: false, message: '' })

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message })
  }, [])

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
    <NotificationsContext.Provider value={{ unread, refresh, showToast }}>
      {children}
      <Snackbar
        visible={toast.visible}
        onDismiss={() => setToast({ visible: false, message: '' })}
        duration={2500}
      >
        {toast.message}
      </Snackbar>
    </NotificationsContext.Provider>
  )
}

export function useNotificationsBadge() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotificationsBadge requires NotificationsProvider')
  return ctx
}


