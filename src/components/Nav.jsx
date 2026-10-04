import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { useMessages } from '../context/MessagesContext'

// Controls the theme via <html class="dark"> and remembers the choice in localStorage
function ThemeToggle({ className = '', withLabel = false }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('vybe-theme', dark ? 'dark' : 'light') } catch (e) {}
  }, [dark])
  return (
    <button onClick={() => setDark((d) => !d)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'} className={className}>
      <Icon name={dark ? 'sun' : 'moon'} />
      {withLabel && <span className="hidden lg:inline">{dark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}

const ITEMS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'search' },
  { to: '/activity', label: 'Activity', icon: 'bell' },
  { to: '/messages', label: 'Messages', icon: 'mail' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]
const soft = 'rounded-xl text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/70'

export default function Nav() {
  const { user, logout } = useAuth()
  const { unread } = useNotifications()
  const { unread: unreadChats } = useMessages()
  const me = { uid: user.uid, name: user.name, photo: user.photo }
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] flex-col md:flex">
        <Link to="/" className="mb-6 px-3 text-3xl font-extrabold tracking-tight">vybe<span className="text-indigo-500"></span></Link>
        <nav className="flex flex-col gap-1">
          {ITEMS.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === '/'}
              className={({ isActive }) => `relative flex items-center gap-3.5 px-3 py-2.5 text-[15px] transition-colors ${isActive ? 'rounded-xl bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : `${soft} font-medium`}`}>
              <Icon name={i.icon} /><span className="hidden lg:inline">{i.label}</span>
              {i.to === '/activity' && unread > 0 && (
                <span className="absolute top-1 left-7 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
              )}
              {i.to === '/messages' && unreadChats > 0 && (
                <span className="absolute top-1 left-7 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{unreadChats > 9 ? '9+' : unreadChats}</span>
              )}
            </NavLink>
          ))}
          <Link to="/create" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-md shadow-indigo-600/25 transition-colors hover:bg-indigo-700">
            <Icon name="add" /><span className="hidden lg:inline">New post</span>
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <ThemeToggle withLabel className={`flex items-center gap-3.5 px-3 py-2.5 text-[15px] font-medium ${soft}`} />
          <button onClick={logout} className={`flex items-center gap-3.5 px-3 py-2.5 text-[15px] font-medium ${soft}`}><Icon name="logout" /><span className="hidden lg:inline">Logout</span></button>
          <Link to="/profile" className={`flex items-center gap-3 p-2 ${soft}`}>
            <Avatar profile={me} size={36} />
            <span className="hidden min-w-0 lg:block"><b className="block truncate text-sm leading-tight text-slate-900 dark:text-slate-100">{user.name}</b><span className="block truncate text-xs text-slate-500">@{user.handle}</span></span>
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/85">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">vybe<span className="text-indigo-500"></span></Link>
          <div className="flex items-center gap-1">
            <NavLink to="/messages" aria-label="Messages" className={({ isActive }) => `p-2.5 ${soft} ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}><span className="relative"><Icon name="mail" />{unreadChats > 0 && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-slate-50 dark:ring-slate-950" />}</span></NavLink>
            <ThemeToggle className={`p-2.5 ${soft}`} />
          </div>
        </div>
      </header>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center justify-items-center">
          {[ITEMS[0], ITEMS[1], { to: '/create', label: 'Create' }, ITEMS[2], ITEMS[4]].map((i) =>
            i.to === '/create' ? (
              <NavLink key={i.to} to={i.to} aria-label="Create post" className="-mt-5 grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"><Icon name="add" /></NavLink>
            ) : (
              <NavLink key={i.to} to={i.to} end={i.to === '/'} aria-label={i.label}
                className={({ isActive }) => `relative p-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                <Icon name={i.icon} />
                {i.to === '/activity' && unread > 0 && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />}
              </NavLink>
            ))}
        </div>
      </nav>
    </>
  )
}