import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
  signOut, updateProfile, onAuthStateChanged,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore'
import { auth, db, googleProvider, firebaseReady } from '../firebase'
import { setYou } from '../data'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const ERRORS = {
  'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed. Please try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase (Authentication > Sign-in method).',
  'auth/unauthorized-domain': 'This domain is not authorized in Firebase (Authentication > Settings > Authorized domains).',
}
export const authError = (e) => ERRORS[e?.code] || 'Something went wrong. Please try again.'

const handleOf = (email = '') => email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'
const toUser = (u) => ({
  uid: u.uid, email: u.email, photo: u.photoURL || '',
  name: u.displayName || handleOf(u.email), handle: handleOf(u.email),
})

// Creates the users/{uid} document on first sign-in
async function ensureProfile(u) {
  try {
    const ref = doc(db, 'users', u.uid)
    if ((await getDoc(ref)).exists()) return
    await setDoc(ref, { uid: u.uid, name: u.name, username: u.handle, email: u.email, photoURL: u.photo, bio: '', createdAt: serverTimestamp() })
  } catch (e) {
    console.warn('Could not save the profile to Firestore. Is Firestore enabled?', e.code || e.message)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const signingUp = useRef(false)

  const apply = (u) => { const nu = u ? toUser(u) : null; setYou(nu); setUser(nu); return nu }

  useEffect(() => {
    if (!firebaseReady) { setLoading(false); return }
    return onAuthStateChanged(auth, (u) => {
      const nu = apply(u)
      setLoading(false)
      if (nu && !signingUp.current) ensureProfile(nu)
    })
  }, [])

  const need = () => { if (!firebaseReady) throw { code: 'no-firebase' } }
  const value = {
    user, loading, firebaseReady,
    async signup(name, email, password) {
      need(); signingUp.current = true
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name.trim() })
        const nu = apply(auth.currentUser)
        await ensureProfile(nu)
      } finally { signingUp.current = false }
    },
    async login(email, password) { need(); await signInWithEmailAndPassword(auth, email, password) },
    async loginGoogle() { need(); await signInWithPopup(auth, googleProvider) },
    async logout() { if (firebaseReady) await signOut(auth) },
    // Profile edit: name, bio, avatar (photo undefined = avatar na badle)
    async updateMyProfile({ name, bio, photo, banner }) {
      need()
      const cur = auth.currentUser
      await updateProfile(cur, photo !== undefined ? { displayName: name, photoURL: photo } : { displayName: name })
      const patch = { name, bio }
      if (photo !== undefined) patch.photoURL = photo
      if (banner !== undefined) patch.banner = banner
      await setDoc(doc(db, 'users', cur.uid), patch, { merge: true })
      apply(auth.currentUser)
      // Purani posts mein bhi naya naam/photo (comments mein purana rehta hai)
      try {
        const snap = await getDocs(query(collection(db, 'posts'), where('uid', '==', cur.uid), limit(400)))
        if (!snap.empty) {
          const b = writeBatch(db)
          snap.docs.forEach((d) => b.update(d.ref, { name, photoURL: cur.photoURL || '' }))
          await b.commit()
        }
      } catch (e) { console.warn('Could not refresh old posts:', e.code || e.message) }
    },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}