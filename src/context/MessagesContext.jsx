import { createContext, useContext, useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'
import { useAuth } from './AuthContext'

const Ctx = createContext(null)
export const useMessages = () => useContext(Ctx)

// chats/{uidA_uidB (sorted)} -> { members:[a,b], lastText, lastSender, lastAt, seen:{uid: time} }
// chats/{id}/messages/{auto} -> { senderId, text, createdAt }
export const chatIdFor = (a, b) => [a, b].sort().join('_')
const ms = (t) => t?.toMillis?.() || 0

export function MessagesProvider({ children }) {
  const { user } = useAuth()
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (!firebaseReady || !user) { setChats([]); return }
    const q = query(collection(db, 'chats'), where('members', 'array-contains', user.uid))
    return onSnapshot(q,
      (s) => setChats(s.docs.map((d) => {
        const c = d.data({ serverTimestamps: 'estimate' })
        return {
          id: d.id,
          otherUid: c.members.find((m) => m !== user.uid),
          lastText: c.lastText || '', lastSender: c.lastSender, lastAt: ms(c.lastAt),
          unread: !!c.lastSender && c.lastSender !== user.uid && ms(c.seen?.[user.uid]) < ms(c.lastAt),
        }
      }).sort((a, b) => b.lastAt - a.lastAt)),
      (e) => console.warn('Chats error:', e.code))
  }, [user?.uid])

  const send = (otherUid, text) => {
    const id = chatIdFor(user.uid, otherUid)
    const ref = doc(db, 'chats', id)
    const b = writeBatch(db)
    b.set(ref, {
      members: [user.uid, otherUid].sort(),
      lastText: text.slice(0, 100), lastSender: user.uid, lastAt: serverTimestamp(),
      seen: { [user.uid]: serverTimestamp() },
    }, { merge: true })
    b.set(doc(collection(ref, 'messages')), { senderId: user.uid, text, createdAt: serverTimestamp() })
    return b.commit()
  }

  const markSeen = (otherUid) =>
    updateDoc(doc(db, 'chats', chatIdFor(user.uid, otherUid)), { [`seen.${user.uid}`]: serverTimestamp() }).catch(() => {})

  return <Ctx.Provider value={{ chats, unread: chats.filter((c) => c.unread).length, send, markSeen }}>{children}</Ctx.Provider>
}