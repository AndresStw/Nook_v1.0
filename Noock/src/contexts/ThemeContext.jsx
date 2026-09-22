import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ThemeContext = createContext()

const DEFAULT_THEME = 'menta'

const VALID_THEMES = [
  'menta', 'ambar', 'violeta', 'coral',
  'azul', 'dorado', 'rosa', 'default', 'fundador'
]

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Carga instantánea desde localStorage
    return localStorage.getItem('nook_theme') || DEFAULT_THEME
  })

  // Aplica el tema al <html data-theme="..."> cada vez que cambia
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('nook_theme', theme)
  }, [theme])

  // Al iniciar sesión, sincroniza con el tema del usuario en la DB
  useEffect(() => {
    const syncFromDb = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (!error && data?.theme && VALID_THEMES.includes(data.theme)) {
        setThemeState(data.theme)
      }
    }

    syncFromDb()

    // Escuchar cambios de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') syncFromDb()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const setTheme = async (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return

    // 1. Cambio inmediato en UI
    setThemeState(newTheme)

    // 2. Persistir en DB si hay usuario logueado
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('users')
        .update({ theme: newTheme })
        .eq('id', user.id)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: VALID_THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider')
  }
  return context
}