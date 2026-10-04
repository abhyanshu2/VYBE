import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase'
import { usePosts } from '../context/PostsContext'
import { useFollow } from '../context/FollowContext'
import { useAuth } from '../context/AuthContext'
import { grad } from '../data'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import Chips from '../components/Chips'
import Feed from '../components/Feed'

export default function Explore() {
  const { posts } = usePosts()
  const { user } = useAuth()
  const { isFollowing, toggleFollow } = useFollow()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [tab, setTab] = useState('All')
  const [people, setPeople] = useState([])

  // Users ek baar load, search browser mein hoti hai
  useEffect(() => {
    getDocs(query(collection(db, 'users'), limit(300)))
      .then((s) => setPeople(s.docs.map((d) => d.data()).filter((u) => u.uid)))
      .catch(() => {})
  }, [])

  const raw = q.trim().toLowerCase()
  const term = raw.replace(/^[#@]/, '')
  const isTag = raw.startsWith('#')

  const postHits = useMemo(() => term
    ? posts.filter((p) => `${p.text} ${p.author.username} ${p.author.name} ${p.type}`.toLowerCase().includes(term)) : [], [posts, term])
  const peopleHits = useMemo(() => term && !isTag
    ? people.filter((u) => u.uid !== user.uid && `${u.name} ${u.username}`.toLowerCase().includes(term)).slice(0, 20) : [], [people, term, isTag, user.uid])

  const showPeople = tab !== 'Posts' && peopleHits.length > 0
  const showPosts = tab !== 'People'

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Explore</h1>
      <div className="relative mb-4">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people, posts or #tags"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 shadow-xs dark:border-slate-700 dark:bg-slate-900" />
      </div>

      {term ? (
        <>
          <Chips items={['All', 'People', 'Posts']} value={tab} onChange={setTab} />
          {showPeople && (
            <section className="mb-5">
              <h2 className="mb-2 text-sm font-bold text-slate-500">People</h2>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                {peopleHits.map((u) => (
                  <div key={u.uid} className="flex items-center gap-3 p-3 md:p-4">
                    <Link to={`/u/${u.uid}`}><Avatar profile={{ uid: u.uid, name: u.name, photo: u.photoURL }} size={44} /></Link>
                    <Link to={`/u/${u.uid}`} className="min-w-0 flex-1">
                      <b className="block truncate">{u.name}</b>
                      <span className="block truncate text-sm text-slate-500">@{u.username}{u.bio ? ` · ${u.bio}` : ''}</span>
                    </Link>
                    <button onClick={() => toggleFollow(u.uid)}
                      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${isFollowing(u.uid) ? 'border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      {isFollowing(u.uid) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === 'People' && !showPeople && <p className="py-10 text-center text-slate-500">No people found for "{q}".</p>}
          {showPosts && (
            <section>
              {tab === 'All' && postHits.length > 0 && <h2 className="mb-2 text-sm font-bold text-slate-500">Posts</h2>}
              {tab === 'All' && postHits.length === 0 && showPeople ? null
                : <Feed posts={postHits} empty={`Nothing found for "${q}". Try a hashtag like #react.`} />}
            </section>
          )}
        </>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2.5">
          {posts.map((p) => (
            <Link key={p.id} to={`/post/${p.id}`} className="group relative flex aspect-square items-end overflow-hidden rounded-lg text-[11px] font-bold text-white sm:rounded-xl sm:text-xs" style={{ background: grad(p.g) }}>
              {p.image && <img src={p.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
              <span className="relative line-clamp-2 w-full bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-5 sm:p-2 sm:pt-6">{p.text.split('\n')[0].slice(0, 50)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}