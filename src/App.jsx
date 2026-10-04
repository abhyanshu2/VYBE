import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import Nav from './components/Nav'
import RightRail from './components/RightRail'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Create from './pages/Create'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Post from './pages/Post'

export default function App() {
  const { pathname } = useLocation()
  const { user, loading } = useAuth()
  const wide = pathname.startsWith('/messages') // the chat view needs more room
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (loading) return <div className="grid min-h-dvh place-items-center text-4xl font-extrabold tracking-tight">vybe<span className="text-indigo-500">.</span></div>
  if (!user && !isAuthPage) return <Navigate to="/login" replace />
  if (user && isAuthPage) return <Navigate to="/" replace />
  if (isAuthPage) return <Routes><Route path="/login" element={<Auth mode="login" />} /><Route path="/signup" element={<Auth mode="signup" />} /></Routes>

  return (
    <div className={`mx-auto grid max-w-[1180px] gap-6 px-3 pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] pb-28 md:grid-cols-[72px_minmax(0,1fr)] md:px-6 md:pt-6 md:pb-6 lg:grid-cols-[232px_minmax(0,1fr)] ${wide ? '' : 'xl:grid-cols-[232px_minmax(0,640px)_300px] xl:justify-center'}`}>
      <Nav />
      <main className={wide ? 'min-w-0' : 'mx-auto w-full min-w-0 max-w-[640px]'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/activity" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/u/:uid" element={<Profile />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:user" element={<Messages />} />
        </Routes>
      </main>
      {!wide && <RightRail />}
    </div>
  )
}