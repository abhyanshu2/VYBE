import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { chatIdFor, useMessages } from '../context/MessagesContext'
import { useAuth } from '../context/AuthContext'
import { useUserDoc } from '../useUserDoc'
import Avatar from '../components/Avatar'

const clock = (d) => (d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
const box = 'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
const asProfile = (u, uid) => ({ uid, name: u?.name || '...', photo: u?.photoURL })

function ChatRow({ uid, last, unread, active }) {
  const u = useUserDoc(uid)
  return (
    <Link to={`/messages/${uid}`} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 ${active ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
      <Avatar profile={asProfile(u, uid)} size={42} />
      <div className="min-w-0 flex-1">
        <b className="block truncate">{u?.name || '...'}</b>
        <span className={`block truncate text-sm ${unread ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>{last || 'Say hello'}</span>
      </div>
      {unread && <span className="size-2.5 shrink-0 rounded-full bg-indigo-500" />}
    </Link>
  )
}

export default function Messages() {
  const { user: other } = useParams()          // route param = doosre user ka uid
  const { user } = useAuth()
  const { chats, send, markSeen } = useMessages()
  const otherDoc = useUserDoc(other)
  const [draft, setDraft] = useState('')
  const [msgs, setMsgs] = useState([])
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  const chat = chats.find((c) => c.otherUid === other)
  const chatId = chat ? chat.id : null

  // Is chat ke messages live (chat tabhi exist karti hai jab pehla message ja chuka ho)
  useEffect(() => {
    setMsgs([])
    if (!chatId) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'desc'), limit(200))
    return onSnapshot(q,
      (s) => setMsgs(s.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })).reverse()),
      (e) => console.warn('Messages error:', e.code))
  }, [chatId])

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [msgs.length, other])
  useEffect(() => { if (chat?.unread) markSeen(other) }, [chat?.unread, other])

  if (other === user.uid) return <Navigate to="/messages" replace />

  const submit = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setSending(true); setDraft('')
    try { await send(other, text) } catch (err) { console.warn(err); setDraft(text) }
    setSending(false)
  }

  // Jis se abhi baat shuru ki par message nahi gaya, wo bhi list ke top pe dikhe
  const list = other && !chat ? [{ id: chatIdFor(user.uid, other), otherUid: other, lastText: '', unread: false }, ...chats] : chats

  return (
    <div className="grid h-[calc(100dvh-10rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] gap-4 md:h-[calc(100dvh-3rem)] md:grid-cols-[280px_minmax(0,1fr)]">
      {/* Chat list */}
      <aside className={`${other ? 'hidden md:flex' : 'flex'} min-h-0 flex-col overflow-y-auto ${box}`}>
        <h2 className="p-4 text-xl font-bold">Messages</h2>
        {list.length === 0 && <p className="px-4 pb-6 text-sm text-slate-500">No chats yet. Open someone's profile and tap Message to start one.</p>}
        {list.map((c) => <ChatRow key={c.id} uid={c.otherUid} last={c.lastText ? `${c.lastSender === user.uid ? 'You: ' : ''}${c.lastText}` : ''} unread={c.unread} active={c.otherUid === other} />)}
      </aside>

      {/* Chat thread */}
      <section className={`${other ? 'flex' : 'hidden md:flex'} min-h-0 flex-col ${box}`}>
        {!other ? (
          <div className="grid flex-1 place-items-center p-6 text-center text-slate-500">Select a conversation to start messaging.</div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
              <Link to="/messages" aria-label="Back" className="rounded-xl px-2 py-1 text-xl text-slate-500 md:hidden">←</Link>
              <Link to={`/u/${other}`} className="flex min-w-0 items-center gap-3">
                <Avatar profile={asProfile(otherDoc, other)} />
                <div className="min-w-0"><b className="block truncate leading-tight">{otherDoc?.name || '...'}</b><span className="block truncate text-sm text-slate-500">@{otherDoc?.username || ''}</span></div>
              </Link>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 sm:p-4">
              {msgs.length === 0 && <p className="m-auto text-slate-500">No messages yet. Say hello!</p>}
              {msgs.map((m) => {
                const mine = m.senderId === user.uid
                return (
                  <div key={m.id} className={`max-w-[85%] sm:max-w-[80%] ${mine ? 'self-end' : 'self-start'}`}>
                    <div className={`rounded-2xl px-3.5 py-2 break-words whitespace-pre-wrap ${mine ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{m.text}</div>
                    <div className={`mt-0.5 text-[11px] text-slate-500 ${mine ? 'text-right' : ''}`}>{clock(m.createdAt?.toDate?.())}</div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
              <input value={draft} maxLength={1000} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message..."
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-800" />
              <button disabled={!draft.trim() || sending} className="shrink-0 rounded-full bg-indigo-600 px-5 font-bold text-white disabled:opacity-40">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}