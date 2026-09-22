import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useChat(matchId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const channelRef = useRef(null)

  // Cargar mensajes al cambiar de match
  useEffect(() => {
    if (!matchId) {
      setMessages([])
      setLoading(false)
      return
    }

    let isMounted = true

    const loadMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      if (!isMounted) return

      if (error) {
        console.error('🚨 NOOK-502: Error cargando mensajes', error)
        setError(error.message)
      } else {
        setMessages(data || [])
        // Marcar como leídos
        await supabase.rpc('mark_messages_read', { p_match_id: matchId })
      }
      setLoading(false)
    }

    loadMessages()

    // Suscribirse a nuevos mensajes de este match
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (!isMounted) return
          setMessages((prev) => {
            // Evitar duplicados si ya lo agregamos optimistamente
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [matchId])

  const sendMessage = async (content) => {
    if (!matchId || !content?.trim() || sending) return

    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content: content.trim(),
    })

    if (error) {
      console.error('🚨 NOOK-502: Error enviando mensaje', error)
      setError(error.message)
    }

    setSending(false)
  }

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
  }
}