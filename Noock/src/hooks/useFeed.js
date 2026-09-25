// src/hooks/useFeed.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useFeed() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.rpc('get_filtered_profiles', {
      p_limit: 20,
    })

    if (error) {
      console.error('Error cargando feed:', error)
      setError(error.message)
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const removeProfile = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  return { profiles, loading, error, refetch: fetchProfiles, removeProfile }
}