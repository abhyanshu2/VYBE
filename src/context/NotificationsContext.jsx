import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { collection, doc, onSnapshot, query, where, writeBatch } from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'
import { useAuth } from './AuthContext'

const Ctx = createContext(null)
export const useNotifications = () => useContext(Ctx)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const ref = useRef([])
  ref.current = items

  // Live: sirf mere liye aaye notifications (newest first, sorting browser mein hoti hai)
  useEffect(() => {
    if (!firebaseReady || !user) { setItems([]); return }
    const q = query(collection(db, 'notifications'), where('toUid', '==', user.uid))
    return onSnapshot(q,
      (s) => setItems(
        s.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          .slice(0, 50)),
      (e) => console.warn('Notifications error:', e.code))
  }, [user?.uid])

  const markAllRead = () => {
    const unread = ref.current.filter((n) => !n.read)
    if (!unread.length) return
    const b = writeBatch(db)
    unread.forEach((n) => b.update(doc(db, 'notifications', n.id), { read: true }))
    return b.commit().catch(console.warn)
  }

  return <Ctx.Provider value={{ items, unread: items.filter((n) => !n.read).length, markAllRead }}>{children}</Ctx.Provider>
}
