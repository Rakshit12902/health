'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Activity, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.updateUser({
      password: password
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
          <h1 className="text-3xl font-bold text-white mb-2">Update Password</h1>
          <p className="text-[var(--color-text-muted)]">Please enter your new password below.</p>
        </div>

        <div className="glass-panel p-8">
          {error && <div className="mb-6 p-3 bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/50 text-[var(--color-danger)] rounded-lg text-sm">{error}</div>}
          
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-[var(--color-success)] mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
              <p className="text-[var(--color-text-muted)] mb-6">Your password has been changed successfully.</p>
              <Link href="/dashboard" className="w-full py-3 block bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] rounded-xl text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--color-accent-glow)]">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] focus:ring-1 focus:ring-[var(--color-accent-cyan)] transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] focus:ring-1 focus:ring-[var(--color-accent-cyan)] transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !password}
                className="w-full py-3 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] rounded-xl text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
