'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type ChatMessage = {
  id: string
  content: string
  createdAt: string
  sender: any
  receiver: any
}

export const AdminApplicationChat: React.FC = () => {
  const { id: docId } = useDocumentInfo()
  const applicationId = useMemo(() => (docId ? String(docId) : ''), [docId])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    if (!applicationId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/chat/messages?applicationId=${encodeURIComponent(applicationId)}`, { credentials: 'include' })
      const data = await res.json().catch(() => ({ messages: [] }))
      if (Array.isArray(data?.messages)) setMessages(data.messages)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!applicationId) return
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(load, 2000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [applicationId, load])

  const onSend = useCallback(async () => {
    if (!applicationId) return
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, content: text }),
      })
      setInput('')
      // optimistically reload
      load()
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }, [applicationId, input, load])

  if (!applicationId) {
    return (
      <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <strong>Czat</strong>
        <div style={{ marginTop: 8, color: '#6b7280' }}>Zapisz dokument, aby włączyć czat.</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <strong>Czat z wolontariuszem</strong>
        {loading && <span style={{ color: '#6b7280', fontSize: 12 }}>Ładowanie…</span>}
      </div>
      <div style={{ maxHeight: 280, overflowY: 'auto', padding: 8, background: '#fafafa', borderRadius: 8, border: '1px solid #eee', marginBottom: 8 }}>
        {messages.length === 0 ? (
          <div style={{ color: '#6b7280' }}>Brak wiadomości</div>
        ) : (
          messages.map(m => {
            const mine = m?.sender?.relationTo === 'admins'
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <div style={{ maxWidth: '85%', background: mine ? '#EAEFFB' : '#F3F4F6', padding: '8px 10px', borderRadius: 10 }}>
                  {mine && <div style={{ color: '#3B82F6', fontSize: 10, fontWeight: 700, marginBottom: 2 }}>Ja</div>}
                  <div style={{ color: '#111827' }}>{m.content}</div>
                  <div style={{ color: '#6b7280', fontSize: 10, marginTop: 4 }}>{new Date(m.createdAt).toLocaleString('pl-PL')}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Napisz wiadomość..."
          style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <button onClick={onSend} disabled={sending || !input.trim()} style={{ padding: '8px 12px', borderRadius: 6, background: '#111827', color: 'white', border: 0 }}>
          Wyślij
        </button>
      </div>
    </div>
  )
}


