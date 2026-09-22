import { useState } from 'react'
import { supabase } from '../lib/supabase'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function usePhotos(userId) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadPhoto = async (file, position) => {
    if (!userId) throw new Error('No user id')

    // Validaciones
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`La imagen no puede pesar más de ${MAX_SIZE_MB}MB`)
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Formato no permitido. Usa JPG, PNG o WEBP.')
    }

    setUploading(true)
    setError(null)

    try {
      // 1. Nombre único para evitar cache
      const ext = file.name.split('.').pop().toLowerCase()
      const fileName = `${userId}/photo-${position}-${Date.now()}.${ext}`

      // 2. Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 3. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // 4. Insertar o actualizar en photos
      const { error: dbError } = await supabase
        .from('photos')
        .upsert(
          {
            user_id: userId,
            url: publicUrl,
            position,
          },
          { onConflict: 'user_id,position' }
        )

      if (dbError) throw dbError

      setUploading(false)
      return publicUrl
    } catch (err) {
      console.error('🚨 NOOK-502: Error subiendo foto', err)
      setError(err.message)
      setUploading(false)
      throw err
    }
  }

  const deletePhoto = async (position, url) => {
    if (!userId) throw new Error('No user id')

    // Extraer el nombre del archivo de la URL
    const fileName = url.split('/user-photos/')[1]
    if (!fileName) throw new Error('URL inválida')

    // 1. Eliminar de Storage
    const { error: storageError } = await supabase.storage
      .from('user-photos')
      .remove([fileName])

    if (storageError) console.warn('Error storage:', storageError)

    // 2. Eliminar de la tabla photos
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('user_id', userId)
      .eq('position', position)

    if (dbError) throw dbError
  }

  return { uploadPhoto, deletePhoto, uploading, error }
}