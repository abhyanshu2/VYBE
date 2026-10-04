import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import { TYPES } from '../data'
import { uploadImage } from '../cloudinary'
import Icon from '../components/Icon'

const MAX_MB = 10
const HINT = {
  Photo: 'Write a caption for your photo (optional)',
  Project: 'Tell people about your project. Use #tags',
  Achievement: 'What did you achieve? Share it with everyone',
  Tutorial: 'What are you teaching? Keep it short',
  Normal: "What's on your mind?",
}
const field = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800'

export default function Create() {
  const { addPost } = usePosts()
  const nav = useNavigate()
  const fileRef = useRef(null)
  const [type, setType] = useState('Photo')
  const [text, setText] = useState('')
  const [code, setCode] = useState('')
  const [image, setImage] = useState('')   // preview URL (local)
  const [file, setFile] = useState(null)    // asli file jo upload hogi
  const [err, setErr] = useState('')
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)

  const isPhoto = type === 'Photo'
  const hasCode = ['Project', 'Tutorial'].includes(type)
  const canPublish = (isPhoto ? !!image : !!text.trim()) && !busy

  const pick = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErr('Please choose an image file (JPG, PNG or WebP).')
    if (file.size > MAX_MB * 1024 * 1024) return setErr(`Image must be smaller than ${MAX_MB} MB.`)
    if (image) URL.revokeObjectURL(image)
    setErr(''); setFile(file); setImage(URL.createObjectURL(file))
  }
  const removeImage = () => {
    URL.revokeObjectURL(image); setImage(''); setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }
  const publish = async () => {
    if (!canPublish) return setErr(isPhoto ? 'Add a photo to publish a photo post.' : 'Write something before publishing.')
    setErr(''); setBusy(true)
    try {
      const url = file ? await uploadImage(file) : ''
      await addPost({ type, text: text.trim(), code: hasCode ? code : '', image: url })
      nav('/')
    } catch (e) {
      setErr(
        e.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'Cloudinary keys missing. Add them in .env and restart npm run dev.'
        : e.code === 'permission-denied' ? 'Permission denied. Publish firestore.rules in the Firebase console.'
        : e.code ? 'Could not save the post. Try again.'
        : `Photo upload failed: ${e.message}`)
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">New post</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(TYPES).map(([t, c]) => (
            <button key={t} onClick={() => { setType(t); setErr('') }}
              className="flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors"
              style={type === t ? { borderColor: c, background: `${c}1A`, color: c } : { borderColor: 'transparent', background: 'rgba(100,116,139,.12)' }}>
              <span className="size-2 rounded-full" style={{ background: c }} />{t}
            </button>
          ))}
        </div>

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
        {image ? (
          <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
            <img src={image} alt="Selected" className="max-h-[420px] w-full object-cover" />
            <button onClick={removeImage} aria-label="Remove photo" className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/75"><Icon name="close" /></button>
            <button onClick={() => fileRef.current.click()} className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-black/75">Change photo</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
            className={`mb-4 flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-center transition-colors ${isPhoto ? 'min-h-56 p-6' : 'p-4'} ${drag ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-300 hover:border-indigo-400 dark:border-slate-700'}`}>
            <span className="grid size-12 place-items-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Icon name="image" /></span>
            <b>{isPhoto ? 'Choose a photo or drag it here' : 'Add a photo (optional)'}</b>
            <span className="text-sm text-slate-500">JPG, PNG or WebP, up to {MAX_MB} MB</span>
          </button>
        )}

        <textarea value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder={HINT[type]} className={`${field} min-h-28`} />
        <div className="mt-1 text-right text-xs text-slate-500">{text.length}/500</div>
        {hasCode && (
          <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste a code snippet (optional)" className={`${field} mt-2 min-h-28 font-mono text-[13px]`} />
        )}

        {err && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{err}</p>}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button onClick={() => nav(-1)} className="rounded-full px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={publish} disabled={!canPublish} className="rounded-full bg-indigo-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">{busy ? (file ? 'Uploading...' : 'Publishing...') : 'Publish'}</button>
        </div>
      </div>
    </>
  )
}