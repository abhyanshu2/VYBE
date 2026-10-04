import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { USERS } from '../data'
import { useMessages } from '../context/MessagesContext'
import Avatar from '../components/Avatar'

const time = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const box = 'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'

export default function Messages() {
  const { user } = useParams()
  const { threads, send } = useMessages()
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)
  const msgs = user ? threads[user] || [] : []

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [msgs.length, user])

  if (user && (!USERS[user] || user === 'you')) return <Navigate to="/messages" replace />

  const people = Object.keys(USERS).filter((u) => u !== 'you')
    .sort((a, b) => (threads[b]?.at(-1)?.ts || 0) - (threads[a]?.at(-1)?.ts || 0))

  const submit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    send(user, draft.trim())
    setDraft('')
  }

  return (
    <div className="grid h-[calc(100dvh-10rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] gap-4 md:h-[calc(100dvh-3rem)] md:grid-cols-[280px_minmax(0,1fr)]">
      {/* Chat list */}
      <aside className={`${user ? 'hidden md:flex' : 'flex'} min-h-0 flex-col overflow-y-auto ${box}`}>
        <h2 className="p-4 text-xl font-bold">Messages</h2>
        {people.map((u) => {
          const last = threads[u]?.at(-1)
          return (
            <Link key={u} to={`/messages/${u}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 ${u === user ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
              <Avatar user={u} size={42} />
              <div className="min-w-0 flex-1">
                <b className="block">{USERS[u].name}</b>
                <span className="block truncate text-sm text-slate-500">{last ? `${last.from === 'you' ? 'You: ' : ''}${last.text}` : 'Start a conversation'}</span>
              </div>
            </Link>
          )
        })}
      </aside>

      {/* Chat thread */}
      <section className={`${user ? 'flex' : 'hidden md:flex'} min-h-0 flex-col ${box}`}>
        {!user ? (
          <div className="grid flex-1 place-items-center p-6 text-center text-slate-500">Select a conversation to start messaging.</div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
              <Link to="/messages" aria-label="Back" className="rounded-xl px-2 py-1 text-xl text-slate-500 md:hidden">←</Link>
              <Avatar user={user} />
              <div><b className="block leading-tight">{USERS[user].name}</b><span className="text-sm text-slate-500">@{user}</span></div>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
              {msgs.length === 0 && <p className="m-auto text-slate-500">No messages yet. Say hello!</p>}
              {msgs.map((m, i) => {
                const mine = m.from === 'you'
                return (
                  <div key={i} className={`max-w-[80%] ${mine ? 'self-end' : 'self-start'}`}>
                    <div className={`break-words rounded-2xl px-3.5 py-2 ${mine ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{m.text}</div>
                    <div className={`mt-0.5 text-[11px] text-slate-500 ${mine ? 'text-right' : ''}`}>{time(m.ts)}</div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message..."
                className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-800" />
              <button className="rounded-full bg-indigo-600 px-5 font-bold text-white">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}