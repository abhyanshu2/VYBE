import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { usePosts } from '../context/PostsContext'
import { useFollow } from '../context/FollowContext'
import { grad, gi } from '../data'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import Chips from '../components/Chips'
import Feed from '../components/Feed'
import EditProfile from '../components/EditProfile'

export default function Profile() {
  const { uid: paramUid } = useParams()
  const { user, logout } = useAuth()
  const { posts } = usePosts()
  const { isFollowing, toggleFollow } = useFollow()
  const uid = paramUid || user.uid
  const isMe = uid === user.uid

  const [tab, setTab] = useState('Posts')
  const [data, setData] = useState(null)        // users/{uid} document (live)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })

  // Profile document live (bio / naam / photo badalte hi update)
  useEffect(() => {
    setTab('Posts'); setMissing(false); setData(null)
    return onSnapshot(doc(db, 'users', uid),
      (s) => (s.exists() ? setData(s.data()) : !isMe && setMissing(true)),
      () => !isMe && setMissing(true))
  }, [uid, isMe])

  // Live follower / following counts
  useEffect(() => {
    const a = onSnapshot(query(collection(db, 'follows'), where('followingId', '==', uid)), (s) => setCounts((c) => ({ ...c, followers: s.size })), () => {})
    const b = onSnapshot(query(collection(db, 'follows'), where('followerId', '==', uid)), (s) => setCounts((c) => ({ ...c, following: s.size })), () => {})
    return () => { a(); b() }
  }, [uid])

  if (missing) return <p className="py-16 text-center text-slate-500">This profile does not exist.</p>
  if (paramUid && isMe) return <Navigate to="/profile" replace />
  if (!isMe && !data) return <p className="py-16 text-center text-slate-500">Loading profile...</p>

  const p = {
    uid,
    name: data?.name || (isMe ? user.name : ''),
    username: data?.username || (isMe ? user.handle : ''),
    photo: data ? data.photoURL : isMe ? user.photo : '',
    bio: data?.bio || '',
    banner: data?.banner || '',
  }
  const mine = posts.filter((x) => x.author.uid === uid)
  const saved = posts.filter((x) => x.saved)
  const showSaved = isMe && tab === 'Saved'

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative aspect-[3/1] w-full" style={{ background: grad(gi(uid)) }}>
          {p.banner && <img src={p.banner} alt="" className="absolute inset-0 size-full object-cover" />}
          {isMe && <button onClick={logout} className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-black/60"><Icon name="logout" />Logout</button>}
        </div>
        <div className="px-4 pb-5 md:px-6">
          <div className="flex items-end justify-between gap-3">
            <div className="relative z-10 -mt-10 inline-block shrink-0 rounded-full ring-4 ring-white sm:-mt-11 dark:ring-slate-900"><Avatar profile={p} size={84} /></div>
            {isMe ? (
              <button onClick={() => setEditing(true)} className="mt-3 rounded-full border border-slate-300 px-5 py-2 text-sm font-bold transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">Edit profile</button>
            ) : (
              <div className="mt-3 flex gap-2">
                <Link to={`/messages/${uid}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-50 sm:px-5 dark:border-slate-600 dark:hover:bg-slate-800">Message</Link>
                <button onClick={() => toggleFollow(uid)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors sm:px-5 ${isFollowing(uid) ? 'border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {isFollowing(uid) ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </div>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight break-words sm:text-2xl">{p.name}</h1>
          <div className="text-sm text-slate-500">@{p.username}</div>
          <p className="mt-3 break-words whitespace-pre-wrap">{p.bio || (isMe ? 'Add a bio with Edit profile.' : '')}</p>
          <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 text-center dark:divide-slate-800 dark:border-slate-800">
            {[[mine.length, 'Posts'], [counts.followers, 'Followers'], [counts.following, 'Following']].map(([n, l]) => (
              <div key={l} className="py-2.5"><b className="block text-lg sm:text-xl">{n}</b><span className="text-xs text-slate-500 sm:text-sm">{l}</span></div>
            ))}
          </div>
        </div>
      </div>
      {isMe && <Chips items={['Posts', 'Saved']} value={tab} onChange={setTab} />}
      <Feed posts={showSaved ? saved : mine}
        empty={showSaved ? 'Saved posts show up here. Tap the bookmark on any post.' : isMe ? 'You have not posted yet. Publish your first post.' : 'No posts yet.'} />
      {editing && <EditProfile profile={p} onClose={() => setEditing(false)} />}
    </>
  )
}