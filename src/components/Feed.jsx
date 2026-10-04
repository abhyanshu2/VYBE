import { Link } from 'react-router-dom'
import PostCard from './PostCard'

export default function Feed({ posts, empty }) {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-500">{empty}</p>
        <Link to="/create" className="mt-4 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700">Create a post</Link>
      </div>
    )
  }
  return <div className="flex flex-col gap-4 md:gap-5">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
}
