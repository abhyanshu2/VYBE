import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const cache = new Map()

// users/{uid} ka document (naam, username, photo...). Ek baar load hoke cache ho jata hai
export function useUserDoc(uid) {
  const [d, setD] = useState(cache.get(uid) || null)
  useEffect(() => {
    if (!uid) return
    if (cache.has(uid)) { setD(cache.get(uid)); return }
    setD(null)
    getDoc(doc(db, 'users', uid))
      .then((s) => { const v = s.exists() ? s.data() : { uid, name: 'Unknown user', username: 'unknown' }; cache.set(uid, v); setD(v) })
      .catch(() => {})
  }, [uid])
  return d
}
