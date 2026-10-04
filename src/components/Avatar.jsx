import { USERS, grad, gi } from '../data'

// <Avatar user="you" />  -> demo/legacy key from data.js
// <Avatar profile={{ uid, name, photo }} /> -> real Firestore user
export default function Avatar({ user, profile, size = 36 }) {
  const u = profile
    ? { name: profile.name || '?', photo: profile.photo || profile.photoURL, g: gi(profile.uid || profile.username) }
    : USERS[user]
  return (
    <div className="grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white"
      style={{ width: size, height: size, background: grad(u.g), fontSize: size * 0.38 }}>
      {u.photo ? <img src={u.photo} alt="" referrerPolicy="no-referrer" className="size-full rounded-full object-cover" /> : u.name[0].toUpperCase()}
    </div>
  )
}