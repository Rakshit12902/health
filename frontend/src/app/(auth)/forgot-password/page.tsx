'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Activity, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Activity className="w-16 h-16 mx-auto text-[var(--color-accent-cyan)] mb-4 drop-shadow-[0_0_15px_var(--color-accent-glow)]" />
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-[var(--color-text-muted)]">Enter your email to receive a reset link</p>
        </div>

        <div className="glass-panel p-8">
          {error && <div className="mb-6 p-3 bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/50 text-[var(--color-danger)] rounded-lg text-sm">{error}</div>}
          {success && (
            <div className="mb-6 p-4 bg-[var(--color-success)]/20 border border-[var(--color-success)]/50 text-[var(--color-success)] rounded-lg text-sm flex flex-col items-center text-center">
              <Mail className="w-8 h-8 mb-2" />
              <p className="font-semibold text-white">Check your email!</p>
              <p className="mt-1 opacity-90">We've sent a password reset link to {email}.</p>
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleReset} className="space-y-6">
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
              
              <button 
                type="submit" 
                disabled={loading || !email}
                className="w-full py-3 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] rounded-xl text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-50"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
