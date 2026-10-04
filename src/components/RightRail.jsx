import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, limit, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase'
import { usePosts } from '../context/PostsContext'
import { useFollow } from '../context/FollowContext'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const card = 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'

export default function RightRail() {
  const { posts } = usePosts()
  const { user } = useAuth()
  const { isFollowing, toggleFollow } = useFollow()
  const [people, setPeople] = useState([])

  useEffect(() => onSnapshot(query(collection(db, 'users'), limit(12)),
    (s) => setPeople(s.docs.map((d) => d.data()).filter((u) => u.uid && u.uid !== user.uid).slice(0, 5)),
    () => {}), [user.uid])

  const counts = {}
  posts.forEach((p) => (p.text.match(/#\w+/g) || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <aside className="sticky top-6 hidden flex-col gap-4 self-start xl:flex">
      <section className={card}>
        <h2 className="mb-3 font-bold">Creators to follow</h2>
        {people.length === 0 && <p className="text-sm text-slate-500">No other creators have joined yet.</p>}
        <div className="flex flex-col gap-3">
          {people.map((u) => (
            <div key={u.uid} className="flex items-center gap-3">
              <Link to={`/u/${u.uid}`}><Avatar profile={{ uid: u.uid, name: u.name, photo: u.photoURL }} size={38} /></Link>
              <Link to={`/u/${u.uid}`} className="min-w-0 flex-1"><b className="block truncate text-sm">{u.name}</b><span className="block truncate text-xs text-slate-500">@{u.username}</span></Link>
              <button onClick={() => toggleFollow(u.uid)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${isFollowing(u.uid) ? 'border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {isFollowing(u.uid) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className={card}>
        <h2 className="mb-3 font-bold">Trending tags</h2>
        {tags.length === 0 && <p className="text-sm text-slate-500">Use #tags in posts to see them here.</p>}
        <div className="flex flex-wrap gap-2">
          {tags.map(([t, n]) => (
            <Link key={t} to={`/explore?q=${encodeURIComponent(t)}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700">
              {t} <span className="text-xs text-slate-500">{n}</span>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}