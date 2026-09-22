import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { usePhotos } from '../../hooks/usePhotos'
import { useAuth } from '../../hooks/useAuth'

export default function Step2Photos({ onNext, onBack }) {
  const { user } = useAuth()
  const { photos, addPhoto, removePhoto } = useOnboardingStore()
  const { uploadPhoto, uploading, error } = usePhotos(user?.id)
  const [localError, setLocalError] = useState(null)

  const refs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
  }

  const handleFileChange = async (e, position) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLocalError(null)
    try {
      const url = await uploadPhoto(file, position)
      addPhoto(url, position)
    } catch (err) {
      setLocalError(err.message)
    }
    e.target.value = ''
  }

  const slots = [1, 2, 3].map((pos) => {
    const found = photos.find((p) => p.position === pos)
    return { position: pos, url: found?.url }
  })

  const canContinue = photos.length >= 1

  return (
    <OnboardingLayout
      step={2}
      title="Tus fotos"
      subtitle="Sube al menos 1. Máximo 3. La primera será tu foto principal."
      onBack={onBack}
      onNext={onNext}
      canContinue={canContinue}
      loading={uploading}
    >
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => (
          <div key={slot.position} className="aspect-square relative">
            {slot.url ? (
              <>
                <img
                  src={slot.url}
                  alt={`Foto ${slot.position}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={() => removePhoto(slot.position)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-error transition-colors"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
                {slot.position === 1 && (
                  <div className="absolute bottom-1.5 left-1.5 bg-accent text-bg text-[9px] px-2 py-0.5 rounded-full font-semibold">
                    Principal
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => refs[slot.position].current?.click()}
                disabled={uploading}
                className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center gap-2 text-text-tertiary hover:text-accent disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Camera size={22} />
                    <span className="text-[10px] font-medium">
                      {slot.position === 1 ? 'Principal' : `Foto ${slot.position}`}
                    </span>
                  </>
                )}
              </button>
            )}
            <input
              ref={refs[slot.position]}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e, slot.position)}
              className="hidden"
            />
          </div>
        ))}
      </div>

      {(error || localError) && (
        <div className="mt-3 p-2.5 bg-error/10 border border-error/20 rounded-lg text-[11px] text-error">
          {error || localError}
        </div>
      )}

      <p className="text-[11px] text-text-tertiary text-center mt-4">
        Formatos permitidos: JPG, PNG, WEBP · Máximo 5MB
      </p>
    </OnboardingLayout>
  )
}