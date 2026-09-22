import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Settings, Palette, Camera, Trash2, Save, LogOut, Loader2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { usePhotos } from '../hooks/usePhotos'
import { supabase } from '../lib/supabase'

const themes = [
  { id: 'menta', name: 'Menta', color: '#14E5C0' },
  { id: 'ambar', name: 'Ámbar', color: '#E89B3C' },
  { id: 'violeta', name: 'Violeta', color: '#A855F7' },
  { id: 'coral', name: 'Coral', color: '#F26B5E' },
  { id: 'azul', name: 'Azul hielo', color: '#3FBFB0' },
  { id: 'dorado', name: 'Dorado', color: '#D9A017' },
  { id: 'rosa', name: 'Rosa suave', color: '#E879B9' },
  { id: 'default', name: 'Default', color: '#000606dd' },
  { id: 'fundador', name: '? ? ?', color: '#E11D48', locked: true },
]

export default function MyProfile() {
  const navigate = useNavigate()
  const { user, profile, refetchProfile, signOut } = useAuth()
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme()
  const { uploadPhoto, deletePhoto, uploading } = usePhotos(user?.id)

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    bio: '',
    city: '',
    birth_date: '',
  })
  const [photos, setPhotos] = useState([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const fileInputRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
  }

  // Cargar datos al montar
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        city: profile.city || '',
        birth_date: profile.birth_date || '',
      })
    }
  }, [profile])

  // Cargar fotos
  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('position')
      setPhotos(data || [])
    }
    load()
  }, [user])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoClick = (position) => {
    fileInputRefs[position].current?.click()
  }

  const handleFileChange = async (e, position) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadPhoto(file, position)
      // Recargar fotos
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('position')
      setPhotos(data || [])
      setFeedback({ type: 'ok', message: 'Foto actualizada' })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
    e.target.value = '' // reset input
  }

  const handleDeletePhoto = async (position, url) => {
    if (!confirm('¿Eliminar esta foto?')) return
    try {
      await deletePhoto(position, url)
      setPhotos((prev) => prev.filter((p) => p.position !== position))
      setFeedback({ type: 'ok', message: 'Foto eliminada' })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)

    const { error } = await supabase
      .from('users')
      .update({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        bio: form.bio.trim(),
        city: form.city.trim(),
        birth_date: form.birth_date || null,
      })
      .eq('id', user.id)

    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      await refetchProfile()
      setFeedback({ type: 'ok', message: 'Cambios guardados' })
      setTimeout(() => setFeedback(null), 3000)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!profile) return null

  // Completar con slots vacíos hasta 3
  const photoSlots = [1, 2, 3].map((pos) => {
    const found = photos.find((p) => p.position === pos)
    return found || { position: pos, url: null }
  })

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto pb-6">
          {/* Header con acciones */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-text-primary">Mi perfil</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-bg-alt transition-colors"
              >
                <Settings size={13} />
                Ajustes
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:text-error hover:border-error/40 transition-colors"
              >
                <LogOut size={13} />
                Salir
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-4 px-4 py-2.5 rounded-xl text-[12px] font-medium ${
                feedback.type === 'ok'
                  ? 'bg-accent/10 text-accent-hover border border-accent/20'
                  : 'bg-error/10 text-error border border-error/20'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Info principal */}
          <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-soft mb-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  maxLength={40}
                  className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  maxLength={30}
                  className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="mb-3">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">
                Tagline <span className="text-text-tertiary/60">({form.tagline.length}/60)</span>
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                maxLength={60}
                placeholder="Una frase que te describa"
                className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 block">
                Bio <span className="text-text-tertiary/60">({form.bio.length}/500)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Cuéntale a los demás quién eres..."
                className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          {/* Fotos */}
          <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-soft mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-text-primary">Mis fotos</h2>
              <span className="text-[11px] text-text-tertiary">
                {photos.length} / 3
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {photoSlots.map((slot) => (
                <div key={slot.position} className="relative aspect-square">
                  {slot.url ? (
                    <>
                      <img
                        src={slot.url}
                        alt={`Foto ${slot.position}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePhotoClick(slot.position)}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                          title="Cambiar"
                        >
                          <Camera size={14} className="text-text-primary" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(slot.position, slot.url)}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-error/90 flex items-center justify-center transition-colors group"
                          title="Eliminar"
                        >
                          <Trash2 size={14} className="text-text-primary group-hover:text-white" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handlePhotoClick(slot.position)}
                      disabled={uploading}
                      className="w-full h-full rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center gap-2 text-text-tertiary hover:text-accent disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Camera size={20} />
                          <span className="text-[10px] font-medium">Subir foto</span>
                        </>
                      )}
                    </button>
                  )}

                  <input
                    ref={fileInputRefs[slot.position]}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, slot.position)}
                    className="hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Selector de tema */}
          <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-soft mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-text-secondary" />
              <h2 className="text-[14px] font-bold text-text-primary">
                Color de tu perfil
              </h2>
            </div>
            <p className="text-[11.5px] text-text-secondary mb-4">
              Elige el color que más te represente. Se aplica a toda la app.
            </p>

            <div className="grid grid-cols-4 gap-2.5">
              {themes.map((theme) => {
                const isLocked = theme.locked
                const isSelected = currentTheme === theme.id

                return (
                  <button
                    key={theme.id}
                    title={isLocked ? 'Tema bloqueado.' : theme.name}
                    onClick={() => {
                      if (isLocked) return
                      setCurrentTheme(theme.id)
                    }}
                    disabled={isLocked}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      isLocked
                        ? 'border-border/40 bg-bg-alt/30 cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'border-text-primary bg-bg-alt'
                          : 'border-border hover:border-text-secondary hover:bg-bg-alt/50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 relative flex items-center justify-center"
                      style={{
                        backgroundColor: theme.color,
                        borderColor: isSelected ? '#1A1A1A' : 'transparent',
                        filter: isLocked ? 'grayscale(100%)' : 'none',
                      }}
                    >
                      {isLocked && (
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] drop-shadow-md">
                          ✕
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        isLocked ? 'text-text-tertiary' : 'text-text-secondary'
                      }`}
                    >
                      {theme.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={14} />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}