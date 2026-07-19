'use client'

import { useState } from 'react'
import Link from "next/link";
import { Activity, BrainCircuit } from "lucide-react";
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
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

  const handleGoogleLogin = async () => {
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
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex overflow-hidden">
      {/* Left side - Visualization */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center">
        {/* Decorative elements for the ECG/DNA look */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-secondary)] to-transparent z-10 opacity-80" />
        <div className="w-full h-full absolute">
          {/* Abstract ECG glowing line SVG */}
          <svg
            className="w-full h-full opacity-60"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <path
              d="M0,500 L200,500 L250,300 L300,700 L350,200 L400,800 L450,500 L1000,500"
              stroke="var(--color-accent-cyan)"
              strokeWidth="4"
              fill="none"
              style={{ filter: "drop-shadow(0 0 10px var(--color-accent-cyan))" }}
            />
          </svg>
        </div>
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/4 text-[var(--color-accent-blue)] opacity-40 animate-pulse">
          <Activity size={64} />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 z-20">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="p-2 bg-[var(--color-bg-glass)] rounded-xl border border-[var(--color-accent-blue)]/30">
              <BrainCircuit className="text-[var(--color-accent-blue)]" size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              CuraMind
            </h1>
          </div>

          <div className="glass-panel p-8">
            <h2 className="text-2xl font-semibold mb-6">Welcome back</h2>
            
            {error && <div className="mb-4 p-3 bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/50 text-[var(--color-danger)] rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-accent-blue)]/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-accent-blue)]/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-2">
                <label className="flex items-center text-[var(--color-text-muted)] cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded bg-[var(--color-bg-secondary)] border-[var(--color-accent-blue)]/30" />
                  Remember me
                </label>
                <button 
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-cyan)] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] text-white font-medium rounded-lg px-4 py-3 shadow-[0_0_15px_var(--color-accent-glow)] hover:shadow-[0_0_25px_var(--color-accent-glow)] transition-all disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[var(--color-text-muted)] text-sm">or</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full mt-6 bg-[var(--color-bg-secondary)] border border-white/10 text-white font-medium rounded-lg px-4 py-3 flex items-center justify-center hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
            
            <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[var(--color-accent-cyan)] hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
