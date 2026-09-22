import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSearch(query, delay = 400) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const trimmed = query?.trim() || ''

    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeoutId = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_users', {
        p_query: trimmed,
        p_limit: 20,
      })

      if (error) {
        console.error('🚨 NOOK-502: Error en búsqueda', error)
        setError(error.message)
        setResults([])
      } else {
        setResults(data || [])
        setError(null)
      }
      setLoading(false)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [query, delay])

  return { results, loading, error }
}