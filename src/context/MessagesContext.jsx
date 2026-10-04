import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useMessages = () => useContext(Ctx)

const now = Date.now()
const SEED = {
  aarav: [{ from: 'aarav', text: 'Hey! Loved your latest post.', ts: now - 3600e3 }],
  sana: [{ from: 'sana', text: 'Thanks for the follow!', ts: now - 7200e3 }],
}
const DEMO_REPLIES = ['Sounds good!', 'Thanks for reaching out!', 'Nice, I was thinking the same.', "Let's catch up later."]

// Firestore (conversations/messages) will replace this later. Components stay the same.
export function MessagesProvider({ children }) {
  const [threads, setThreads] = useState(SEED)

  const push = (user, msg) => setThreads((t) => ({ ...t, [user]: [...(t[user] || []), msg] }))

  const send = (user, text) => {
    push(user, { from: 'you', text, ts: Date.now() })
    // DEMO: fake auto-reply. Remove once real Firestore messaging is in place.
    setTimeout(() => push(user, { from: user, text: DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)], ts: Date.now() }), 1200)
  }

  return <Ctx.Provider value={{ threads, send }}>{children}</Ctx.Provider>
}