import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadImage } from '../cloudinary'
import Avatar from './Avatar'
import Icon from './Icon'

const MAX_MB = 5
const field = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800'

// Mobile pe neeche se khulne wali sheet, laptop pe beech ka dialog
export default function EditProfile({ profile, onClose }) {
  const { updateMyProfile } = useAuth()
  const fileRef = useRef(null)
  const [name, setName] = useState(profile.name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [busy])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const pick = (f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return setErr('Please choose an image file (JPG, PNG or WebP).')
    if (f.size > MAX_MB * 1024 * 1024) return setErr(`Image must be smaller than ${MAX_MB} MB.`)
    setErr(''); setFile(f); setPreview(URL.createObjectURL(f))
  }

  const save = async () => {
    if (!name.trim()) return setErr('Name cannot be empty.')
    setErr(''); setBusy(true)
    try {
      const photo = file ? await uploadImage(file, { avatar: true }) : undefined
      await updateMyProfile({ name: name.trim(), bio: bio.trim(), photo })
      onClose()
    } catch (e) {
      setErr(e.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'Cloudinary keys missing in .env.'
        : e.code === 'permission-denied' ? 'Permission denied. Publish the latest firestore.rules in Firebase.'
        : e.code ? 'Could not save your profile. Try again.' : `Photo upload failed: ${e.message}`)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 md:items-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Edit profile"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl md:max-w-md md:rounded-3xl md:pb-5 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">Edit profile</h2>
          <button onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Icon name="close" /></button>
        </div>

        <div className="mb-5 flex items-center gap-4">
          <Avatar profile={{ ...profile, photo: preview || profile.photo }} size={72} />
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
            <button type="button" onClick={() => fileRef.current.click()} disabled={busy}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">Change photo</button>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP, up to {MAX_MB} MB</p>
          </div>
        </div>

        <label className="mb-1 block text-sm font-semibold">Name</label>
        <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className={field} autoComplete="name" />

        <label className="mt-4 mb-1 block text-sm font-semibold">Bio</label>
        <textarea value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} placeholder="Tell people what you build" className={`${field} min-h-24`} />
        <div className="mt-1 text-right text-xs text-slate-500">{bio.length}/160</div>

        {err && <p role="alert" className="mt-2 text-sm font-medium text-rose-600">{err}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} disabled={busy} className="rounded-full px-4 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={save} disabled={busy} className="rounded-full bg-indigo-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">{busy ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
