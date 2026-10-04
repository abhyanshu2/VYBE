// Cloudinary unsigned upload (browser se seedha, backend ki zaroorat nahi)
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryReady = !!(CLOUD && PRESET)

// Returns the optimized image URL. avatar:true -> 400x400 face-aware square crop
export async function uploadImage(file, { avatar = false } = {}) {
  if (!cloudinaryReady) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED')
  }
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', PRESET)
  body.append('folder', avatar ? 'vybe/avatars' : 'vybe/posts')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.secure_url) {
    console.warn('Cloudinary error:', data?.error?.message)
    throw new Error(data?.error?.message || 'UPLOAD_FAILED')
  }
  const t = avatar ? 'c_fill,g_auto,w_400,h_400,f_auto,q_auto' : 'f_auto,q_auto,w_1080'
  return data.secure_url.replace('/upload/', `/upload/${t}/`)
}