import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authError, useAuth } from '../context/AuthContext'

const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800'

export default function Auth({ mode }) {
  const isSignup = mode === 'signup'
  const { signup, login, loginGoogle, firebaseReady } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const run = async (fn) => {
    setErr(''); setBusy(true)
    try { await fn() } catch (e) {
      setErr(e.code === 'no-firebase' ? 'Firebase is not connected. Check your .env file and restart npm run dev.' : authError(e))
    } finally { setBusy(false) }
  }
  const submit = (e) => {
    e.preventDefault()
    if (isSignup && !form.name.trim()) return setErr('Please enter your name.')
    run(() => (isSignup ? signup(form.name, form.email.trim(), form.password) : login(form.email.trim(), form.password)))
  }

  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white md:flex">
        <div className="text-4xl font-extrabold tracking-tight">vybe.</div>
        <div>
          <h2 className="max-w-sm text-4xl leading-tight font-extrabold tracking-tight">A home for developers and creators.</h2>
          <p className="mt-4 max-w-sm text-white/80">Share projects, tutorials, achievements and photos, and message people directly.</p>
        </div>
        <div className="text-sm text-white/70">Free to join.</div>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-3xl font-extrabold tracking-tight md:hidden">vybe<span className="text-indigo-500">.</span></div>
          <h1 className="text-2xl font-extrabold tracking-tight">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-1 mb-6 text-slate-500">{isSignup ? 'It only takes a few seconds.' : 'Log in to see your feed.'}</p>

          {!firebaseReady && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">Firebase is not connected. Fill in your .env file and restart npm run dev.</p>}

          <button onClick={() => run(loginGoogle)} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 font-semibold transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
            <span className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 text-[11px] font-extrabold text-white">G</span>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-sm text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />or<span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /></div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {isSignup && <input value={form.name} onChange={set('name')} placeholder="Full name" autoComplete="name" className={input} />}
            <input type="email" value={form.email} onChange={set('email')} placeholder="Email" autoComplete="email" required className={input} />
            <input type="password" value={form.password} onChange={set('password')} placeholder="Password (6+ characters)" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={6} className={input} />
            {err && <p role="alert" className="text-sm font-medium text-rose-600">{err}</p>}
            <button disabled={busy} className="mt-1 rounded-xl bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
              {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account? ' : 'New to VYBE? '}
            <Link to={isSignup ? '/login' : '/signup'} className="font-bold text-indigo-600 dark:text-indigo-400">{isSignup ? 'Log in' : 'Sign up'}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}