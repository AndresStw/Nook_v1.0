import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBlindChat(chatId) {
  const [chat, setChat] = useState(null)
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)
  const channelRef = useRef(null)
  const timerRef = useRef(null)

  // Obtener user id
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null)
    })
  }, [])

  // Cargar chat + perfil + mensajes
  useEffect(() => {
    if (!chatId) return
    let isMounted = true

    const load = async () => {
      setLoading(true)

      // 1. Cargar el blind_chat
      const { data: chatData, error: chatError } = await supabase
        .from('blind_chats')
        .select('*')
        .eq('id', chatId)
        .single()

      if (chatError || !chatData) {
        if (isMounted) {
          setError(chatError?.message || 'Chat no encontrado')
          setLoading(false)
        }
        return
      }

      // 2. Cargar el perfil censurado
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_blind_profile',
        { chat_id: chatId }
      )

      // 3. Cargar mensajes
      const { data: messagesData } = await supabase
        .from('blind_messages')
        .select('*')
        .eq('blind_chat_id', chatId)
        .order('created_at', { ascending: true })

      if (!isMounted) return

      setChat(chatData)
      if (!profileError) setProfile(profileData)
      setMessages(messagesData || [])
      setLoading(false)
    }

    load()

    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel(`blind-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blind_messages',
          filter: `blind_chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (!isMounted) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'blind_chats',
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          if (!isMounted) return
          setChat(payload.new)
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
  }, [chatId])

  // Timer countdown
  useEffect(() => {
  if (!chat?.expires_at || chat.status !== 'active') return

  const updateTimer = () => {
    const now = new Date().getTime()
    const expires = new Date(chat.expires_at).getTime()
    const diff = Math.max(0, Math.floor((expires - now) / 1000))
    setTimeLeft(diff)
  }

  updateTimer()
  timerRef.current = setInterval(updateTimer, 1000)

  return () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }
}, [chat?.expires_at, chat?.status])

  // Enviar mensaje
  const sendMessage = useCallback(async (content) => {
    if (!chatId || !content?.trim() || sending) return
    if (chat?.status !== 'active' || timeLeft <= 0) return

    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('blind_messages').insert({
      blind_chat_id: chatId,
      sender_id: user.id,
      content: content.trim(),
    })

    if (error) {
      console.error('🚨 NOOK-502: Error enviando mensaje ciego', error)
    }
    setSending(false)
  }, [chatId, sending, chat?.status, timeLeft])

  // Decidir match o pass
  const decide = useCallback(async (decision) => {
    if (!chatId || deciding) return
    setDeciding(true)

    const { data, error } = await supabase.rpc('respond_to_blind_chat', {
      p_chat_id: chatId,
      p_decision: decision,
    })

    if (error) {
      console.error('🚨 NOOK-403: Error decidiendo', error)
    }

    setDeciding(false)
    return data
  }, [chatId, deciding])

  return {
    chat,
    profile,
    messages,
    loading,
    error,
    sending,
    deciding,
    timeLeft,
    currentUserId,
    sendMessage,
    decide,
  }
}