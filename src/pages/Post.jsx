import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import PostCard from '../components/PostCard'

// /post/:id -> ek single post (share link aur notifications yahin kholte hain)
export default function Post() {
  const { id } = useParams()
  const { posts, fetchPost, loading } = usePosts()
  const live = posts.find((p) => p.id === id)
  const [fetched, setFetched] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    setFetched(null); setMissing(false)
    if (live || loading) return
    fetchPost(id).then((p) => (p ? setFetched(p) : setMissing(true)))
  }, [id, !!live, loading])

  const post = live || fetched
  return (
    <>
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">← Back to feed</Link>
      {post ? <PostCard post={post} />
        : missing ? <p className="py-16 text-center text-slate-500">This post does not exist or was deleted.</p>
        : <p className="py-16 text-center text-slate-500">Loading post...</p>}
    </>
  )
}
