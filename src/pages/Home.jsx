import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import { useAuth } from '../context/AuthContext'
import { TYPES } from '../data'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'
import Chips from '../components/Chips'
import Feed from '../components/Feed'

export default function Home() {
  const { posts, loading, error } = usePosts()
  const { user } = useAuth()
  const [filter, setFilter] = useState('All')
  const list = posts.filter((p) => filter === 'All' || p.type === filter)
  return (
    <>
      <Link to="/create" className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50">
        <Avatar profile={{ uid: user.uid, name: user.name, photo: user.photo }} size={40} />
        <span className="flex-1 text-slate-500">What do you want to share today?</span>
        <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><Icon name="image" />Photo</span>
      </Link>
      <Chips items={['All', ...Object.keys(TYPES)]} value={filter} onChange={setFilter} />
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
      {loading ? <p className="py-10 text-center text-slate-500">Loading posts...</p> : <Feed posts={list} empty={`No ${filter} posts yet. Be the first to publish one.`} />}
    </>
  )
}