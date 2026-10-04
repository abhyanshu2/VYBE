import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import { TYPES, grad } from '../data'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import Icon from './Icon'

const Tagged = ({ text }) =>
  text.split(/(#\w+)/g).map((part, i) =>
    part.startsWith('#') ? <span key={i} className="font-semibold text-indigo-600 dark:text-indigo-400">{part}</span> : part)

export default function PostCard({ post }) {
  const { toggleLike, toggleSave, addComment, deletePost } = usePosts()
  const { user } = useAuth()
  const mine = post.author.uid === user?.uid
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const color = TYPES[post.type]

  const share = async () => {
    const url = `${location.origin}/post/${post.id}`
    if (navigator.share) return navigator.share({ title: 'VYBE', url }).catch(() => {})
    try { await navigator.clipboard.writeText(url) } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1600)
  }
  const submit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    addComment(post.id, draft.trim()); setDraft('')
  }
  const btn = 'flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center gap-2.5 px-3 pt-3.5 pb-3 sm:gap-3 sm:px-4 sm:pt-4">
        <Link to={mine ? '/profile' : `/u/${post.author.uid}`}><Avatar profile={post.author} size={40} /></Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link to={mine ? '/profile' : `/u/${post.author.uid}`} className="block truncate font-bold hover:underline">{post.author.name}</Link>
          <span className="block truncate text-[13px] text-slate-500">@{post.author.username} · {post.time}</span>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold" style={{ color, background: `${color}1F` }}>{post.type}</span>
        {mine && <button onClick={() => confirm('Delete this post?') && deletePost(post.id)} aria-label="Delete post" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"><Icon name="close" /></button>}
      </header>

      {post.text && <p className="px-3 pb-3 text-[15px] sm:px-4 leading-relaxed break-words whitespace-pre-wrap"><Tagged text={post.text} /></p>}

      {post.code && (
        <pre className="no-scrollbar mx-3 mb-3 overflow-x-auto sm:mx-4 rounded-xl bg-slate-950 p-4 font-mono text-[13px] leading-relaxed text-indigo-200"><code>{post.code}</code></pre>
      )}

      {post.image ? (
        <img src={post.image} alt="" loading="lazy" onDoubleClick={() => !post.liked && toggleLike(post.id)}
          className="mx-auto mb-1 max-h-[560px] w-full object-cover select-none" />
      ) : post.type === 'Photo' ? (
        <div className="mb-1 grid aspect-[16/10] place-items-center text-2xl font-extrabold text-white/90" style={{ background: grad(post.g) }}>vybe</div>
      ) : null}

      <div className="flex items-center gap-0.5 px-2.5 py-2">
        <button onClick={() => toggleLike(post.id)} aria-label="Like" className={`${btn} ${post.liked ? 'text-rose-600!' : ''}`}>
          <Icon name="heart" filled={post.liked} />{post.likes}
        </button>
        <button onClick={() => setOpen(!open)} aria-label="Comments" className={btn}><Icon name="chat" />{post.comments.length}</button>
        <button onClick={share} aria-label="Share" className={btn}><Icon name="share" />{copied && <span className="text-xs">Link copied</span>}</button>
        <button onClick={() => toggleSave(post.id)} aria-label="Save" className={`${btn} ml-auto ${post.saved ? 'text-indigo-600!' : ''}`}>
          <Icon name="bookmark" filled={post.saved} />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 px-3 py-3 text-sm sm:px-4 dark:border-slate-800">
          {post.comments.map((c, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Avatar profile={c} size={28} />
              <div className="min-w-0 flex-1 rounded-2xl bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <b>{(c.name || '').split(' ')[0]}</b> <span className="break-words">{c.text}</span>
                {c.uid !== user?.uid && <Link to={`/u/${c.uid}`} className="ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">Profile</Link>}
              </div>
            </div>
          ))}
          <form onSubmit={submit} className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment"
              className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <button className="shrink-0 rounded-full bg-indigo-600 px-4 font-bold text-white hover:bg-indigo-700">Post</button>
          </form>
        </div>
      )}
    </article>
  )
}