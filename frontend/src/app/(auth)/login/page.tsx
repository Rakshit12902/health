'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Activity className="w-16 h-16 mx-auto text-[var(--color-accent-cyan)] mb-4 drop-shadow-[0_0_15px_var(--color-accent-glow)]" />
          <h1 className="text-4xl font-bold text-white mb-2">CuraMind</h1>
          <p className="text-[var(--color-text-muted)]">Sign in to your medical assistant</p>
        </div>

        <div className="glass-panel p-8">
          {error && <div className="mb-4 p-3 bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/50 text-[var(--color-danger)] rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-bg-primary)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] focus:ring-1 focus:ring-[var(--color-accent-cyan)] transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--color-text-muted)]">Password</label>
                <button 
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-xs text-[var(--color-accent-blue)] hover:text-[var(--color-accent-cyan)] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-bg-primary)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] focus:ring-1 focus:ring-[var(--color-accent-cyan)] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] rounded-xl text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <hr className="w-full border-white/10" />
            <span className="px-2 text-sm text-[var(--color-text-muted)]">OR</span>
            <hr className="w-full border-white/10" />
          </div>

          <button 
            type="button"
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                  }
                })
                if (error) setError(error.message)
              } catch (err: any) {
                setError(err.message || "An unexpected error occurred")
              }
            }}
            className="mt-6 w-full py-3 bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl text-white font-semibold hover:bg-[var(--color-accent-blue)]/20 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Don't have an account? <Link href="/signup" className="text-[var(--color-accent-cyan)] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
