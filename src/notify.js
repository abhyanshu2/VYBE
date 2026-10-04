import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// notifications/{id} -> { toUid, fromUid, fromName, fromUsername, fromPhoto, type, postId?, snippet?, read, createdAt }
const build = (me, toUid, type, extra) => ({
  toUid, fromUid: me.uid, fromName: me.name, fromUsername: me.handle, fromPhoto: me.photo || '',
  type, read: false, createdAt: serverTimestamp(), ...extra,
})

// Fixed id (like/follow) so repeated taps never create duplicates
export const notifyOnce = (me, id, toUid, type, extra = {}) =>
  !me || me.uid === toUid ? null : setDoc(doc(db, 'notifications', id), build(me, toUid, type, extra)).catch(() => {})

// Random id (every comment is its own notification)
export const notifyAdd = (me, toUid, type, extra = {}) =>
  !me || me.uid === toUid ? null : addDoc(collection(db, 'notifications'), build(me, toUid, type, extra)).catch(() => {})

// Unlike / unfollow -> remove the notification
export const unnotify = (id) => deleteDoc(doc(db, 'notifications', id)).catch(() => {})
