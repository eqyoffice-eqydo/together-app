import { useState } from 'react'
import { createUser, loginUser } from '../lib/db'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await createUser(email, password)
        setMessage('Check your email to confirm your account.')
      } else {
        const data = await loginUser(email, password)
        onAuth(data.user)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-8 py-16">

      {/* Logo */}
      <p className="text-gray-400 text-sm tracking-[0.3em] uppercase font-light">
        together
      </p>

      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Welcome back.' : 'Join the movement.'}
          </h1>
          <p className="text-gray-400 text-sm font-light">
            {mode === 'login' ? 'Sign in to continue.' : 'Create your free account.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border border-gray-200 focus:border-gray-400 text-gray-900 text-sm placeholder-gray-300 rounded-xl px-4 py-3.5 outline-none transition-colors bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-gray-200 focus:border-gray-400 text-gray-900 text-sm placeholder-gray-300 rounded-xl px-4 py-3.5 outline-none transition-colors bg-white"
            />
          </div>

          {error && (
            <div className="border border-red-100 bg-red-50 rounded-xl px-4 py-3">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="border border-emerald-100 bg-emerald-50 rounded-xl px-4 py-3">
              <p className="text-emerald-600 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-700 active:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-base py-4 rounded-xl transition-all duration-200 mt-1"
          >
            {loading
              ? mode === 'login' ? 'Signing in…' : 'Creating account…'
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-gray-400 text-sm">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}
            className="text-gray-900 font-medium hover:underline transition-all"
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>

      </div>

      {/* Quote */}
      <p className="text-gray-300 text-xs text-center italic max-w-xs leading-relaxed">
        "The most common way people give up their power is by thinking they don't have any."
      </p>

    </div>
  )
}
