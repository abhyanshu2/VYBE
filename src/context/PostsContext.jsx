import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, limit,
  onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'
import { gi } from '../data'
import { useAuth } from './AuthContext'
import { timeAgo } from '../time'
import { notifyAdd, notifyOnce, unnotify } from '../notify'

const Ctx = createContext(null)
export const usePosts = () => useContext(Ctx)

export function PostsProvider({ children }) {
  const { user } = useAuth()
  const [raw, setRaw] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Live feed: latest 60 posts
  useEffect(() => {
    if (!firebaseReady || !user) { setRaw([]); setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(60))
    return onSnapshot(q,
      (snap) => {
        setRaw(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })))
        setError(''); setLoading(false)
      },
      (e) => { console.warn('Posts load error:', e.code); setError('Could not load posts. Check your Firestore rules.'); setLoading(false) })
  }, [user?.uid])

  // My saved post ids live on users/{uid}.saved
  useEffect(() => {
    if (!firebaseReady || !user) { setSavedIds([]); return }
    return onSnapshot(doc(db, 'users', user.uid), (s) => setSavedIds(s.data()?.saved || []), () => {})
  }, [user?.uid])

  const shape = (p) => ({
    id: p.id,
    author: { uid: p.uid, name: p.name, username: p.username, photo: p.photoURL },
    type: p.type, text: p.text || '', code: p.code || '', image: p.image || '',
    time: timeAgo(p.createdAt?.toDate?.()),
    g: gi(p.uid),
    likes: (p.likedBy || []).length,
    liked: !!user && (p.likedBy || []).includes(user.uid),
    saved: savedIds.includes(p.id),
    comments: p.comments || [],
  })
  const posts = useMemo(() => raw.map(shape), [raw, savedIds, user?.uid])

  const postRef = (id) => doc(db, 'posts', id)
  const byId = (id) => posts.find((p) => p.id === id)

  const value = {
    posts, loading, error,
    // Ek post ek baar laana (post page ke liye, agar live feed ke 60 mein na ho)
    fetchPost: async (id) => {
      try { const s = await getDoc(postRef(id)); return s.exists() ? shape({ id: s.id, ...s.data({ serverTimestamps: 'estimate' }) }) : null } catch (e) { return null }
    },
    toggleLike: (id) => {
      const p = byId(id); if (!p || !user) return
      const nid = `like_${id}_${user.uid}`
      return updateDoc(postRef(id), { likedBy: p.liked ? arrayRemove(user.uid) : arrayUnion(user.uid) })
        .then(() => (p.liked ? unnotify(nid) : notifyOnce(user, nid, p.author.uid, 'like', { postId: id, snippet: p.text.slice(0, 80) })))
        .catch(console.warn)
    },
    toggleSave: (id) => {
      const p = byId(id); if (!p || !user) return
      return setDoc(doc(db, 'users', user.uid), { saved: p.saved ? arrayRemove(id) : arrayUnion(id) }, { merge: true }).catch(console.warn)
    },
    addComment: (id, text) => {
      if (!user) return
      const c = { uid: user.uid, name: user.name, username: user.handle, photo: user.photo || '', text, ts: Date.now() }
      const p = byId(id)
      return updateDoc(postRef(id), { comments: arrayUnion(c) })
        .then(() => p && notifyAdd(user, p.author.uid, 'comment', { postId: id, snippet: text.slice(0, 80) }))
        .catch(console.warn)
    },
    addPost: ({ type, text, code, image }) =>
      addDoc(collection(db, 'posts'), {
        uid: user.uid, name: user.name, username: user.handle, photoURL: user.photo || '',
        type, text, code: code || '', image: image || '', likedBy: [], comments: [], createdAt: serverTimestamp(),
      }),
    deletePost: (id) => deleteDoc(postRef(id)).catch(console.warn),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}