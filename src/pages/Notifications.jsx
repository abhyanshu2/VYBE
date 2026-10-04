import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext'
import { timeAgo } from '../time'
import Avatar from '../components/Avatar'

const VERB = { like: 'liked your post', comment: 'commented on your post', follow: 'started following you' }

export default function Notifications() {
  const { items, unread, markAllRead } = useNotifications()
  // Page chhodte hi sab "read" ho jayenge (page pe rehte hue unread highlighted dikhte hain)
  useEffect(() => () => { markAllRead() }, [])

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Activity</h1>
        {unread > 0 && <button onClick={markAllRead} className="rounded-full px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800">Mark all read</button>}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No activity yet. When someone likes, comments or follows you, it shows up here instantly.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {items.map((n) => (
            <Link key={n.id} to={n.type === 'follow' ? `/u/${n.fromUid}` : `/post/${n.postId}`}
              className={`flex items-center gap-3 p-3.5 transition-colors hover:bg-slate-50 md:p-4 dark:hover:bg-slate-800/60 ${!n.read ? 'bg-indigo-50/60 dark:bg-indigo-500/5' : ''}`}>
              <Avatar profile={{ uid: n.fromUid, name: n.fromName, photo: n.fromPhoto }} size={42} />
              <div className="min-w-0 flex-1 text-[15px] leading-snug">
                <b>{n.fromName}</b> {VERB[n.type]}
                {n.snippet && <span className="block truncate text-sm text-slate-500">"{n.snippet}"</span>}
                <span className="text-xs text-slate-500">{timeAgo(n.createdAt?.toDate?.())}</span>
              </div>
              {!n.read && <span className="size-2.5 shrink-0 rounded-full bg-indigo-500" />}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}