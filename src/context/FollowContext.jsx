import { createContext, useContext, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'
import { useAuth } from './AuthContext'
import { notifyOnce, unnotify } from '../notify'

const Ctx = createContext(null)
export const useFollow = () => useContext(Ctx)

// follows/{followerUid_followingUid} -> { followerId, followingId, createdAt }
export function FollowProvider({ children }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(new Set())

  useEffect(() => {
    if (!firebaseReady || !user) { setFollowing(new Set()); return }
    const q = query(collection(db, 'follows'), where('followerId', '==', user.uid))
    return onSnapshot(q, (s) => setFollowing(new Set(s.docs.map((d) => d.data().followingId))), () => {})
  }, [user?.uid])

  const toggleFollow = (targetUid) => {
    if (!user || targetUid === user.uid) return
    const ref = doc(db, 'follows', `${user.uid}_${targetUid}`)
    const nid = `follow_${user.uid}_${targetUid}`
    return (following.has(targetUid)
      ? deleteDoc(ref).then(() => unnotify(nid))
      : setDoc(ref, { followerId: user.uid, followingId: targetUid, createdAt: serverTimestamp() })
          .then(() => notifyOnce(user, nid, targetUid, 'follow'))
    ).catch(console.warn)
  }

  return <Ctx.Provider value={{ following, isFollowing: (uid) => following.has(uid), toggleFollow }}>{children}</Ctx.Provider>
}