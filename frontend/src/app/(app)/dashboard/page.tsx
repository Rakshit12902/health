'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HealthTrends } from "@/components/Dashboard/HealthTrends"
import dynamic from 'next/dynamic'

const ClinicMap = dynamic(() => import('@/components/Map/ClinicMap').then(mod => mod.ClinicMap), {
  ssr: false,
  loading: () => <div className="h-96 glass-panel rounded-2xl flex items-center justify-center border border-[var(--color-accent-blue)]/30"><div className="w-8 h-8 border-4 border-[var(--color-accent-cyan)] border-t-transparent rounded-full animate-spin"></div></div>
})
import { Activity, User as UserIcon, Droplets, Calendar, FileText, Share2, Copy, Check, X } from "lucide-react"

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('User')
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  
  const handleShare = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${baseUrl}/api/chat/doctor-links`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ user_id: user.id, expires_in_days: 7 })
          })
          const data = await res.json()
          if (data.token) {
              const url = `${window.location.origin}/shared/${data.token}`
              setShareLink(url)
              setCopied(false)
          }
      } catch (e) {
          console.error(e)
      }
  }

  const copyToClipboard = () => {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
  }
  
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${baseUrl}/api/chat/profile?user_id=${user.id}`);
          if (res.ok) {
            const result = await res.json();
            if (result.data) {
              setProfile(result.data);
            }
          }
        } catch (e) {
          console.error("Failed to load profile", e);
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
        
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Welcome, {userName}</h1>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="flex items-center gap-2 bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-cyan)] hover:bg-[var(--color-accent-blue)]/40 px-4 py-2.5 rounded-xl transition-colors font-medium border border-[var(--color-accent-cyan)]/30">
              <Share2 size={18} /> Share with Doctor
            </button>
            <button className="glass-panel p-2.5 text-[var(--color-accent-cyan)] hover:text-white transition-colors">
              <Activity size={24} />
            </button>
          </div>
        </header>
        
        {/* Share Link Modal */}
        {shareLink && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="glass-panel w-full max-w-lg rounded-2xl border border-[var(--color-accent-cyan)]/30 overflow-hidden shadow-2xl shadow-[var(--color-accent-cyan)]/20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[var(--color-accent-blue)]/10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="text-[var(--color-accent-cyan)]" size={24} /> 
                            Doctor Sharing Link
                        </h2>
                        <button onClick={() => setShareLink('')} className="text-[var(--color-text-muted)] hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-[var(--color-text-muted)] mb-6">
                            Share this secure, read-only link with your doctor. It grants access to your health metrics and prescriptions, and automatically expires in 7 days.
                        </p>
                        
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-2 rounded-xl">
                            <input 
                                type="text" 
                                readOnly 
                                value={shareLink}
                                className="bg-transparent border-none outline-none text-white w-full px-2 text-sm font-mono"
                            />
                            <button 
                                onClick={copyToClipboard}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-2 px-4 ${copied ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-accent-cyan)] text-black hover:bg-[#4be6c1]'}`}
                            >
                                {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Dynamic Profile Metrics */}
        {loading ? (
          <div className="glass-panel p-6 flex justify-center items-center h-32">
             <div className="w-8 h-8 border-4 border-[var(--color-accent-cyan)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profile && (profile.age || profile.blood_group || profile.gender) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.age && (
              <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group border-[var(--color-accent-blue)]/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-blue)]/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-[var(--color-accent-blue)]/20 transition-all"></div>
                <Calendar className="text-[var(--color-accent-blue)] mb-3" size={32} />
                <h3 className="text-[var(--color-text-muted)] font-medium">Age</h3>
                <p className="text-3xl font-bold text-white mt-1">{profile.age} <span className="text-sm text-[var(--color-text-muted)]">years</span></p>
              </div>
            )}

            {profile.blood_group && (
              <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group border-[var(--color-warning)]/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-warning)]/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-[var(--color-warning)]/20 transition-all"></div>
                <Droplets className="text-[var(--color-warning)] mb-3" size={32} />
                <h3 className="text-[var(--color-text-muted)] font-medium">Blood Group</h3>
                <p className="text-3xl font-bold text-white mt-1">{profile.blood_group}</p>
              </div>
            )}

            {profile.gender && (
              <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group border-[var(--color-accent-cyan)]/30">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-cyan)]/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-[var(--color-accent-cyan)]/20 transition-all"></div>
                 <UserIcon className="text-[var(--color-accent-cyan)] mb-3" size={32} />
                 <h3 className="text-[var(--color-text-muted)] font-medium">Gender</h3>
                 <p className="text-3xl font-bold text-white mt-1 capitalize">{profile.gender}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel p-8 text-center border-dashed border-2 border-white/10">
            <UserIcon className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Complete Your Profile</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
              Add your age, blood group, and medical history in the Settings page to see your personalized health metrics here.
            </p>
          </div>
        )}

        {/* Health Trends */}
        {profile?.id && (
          <div className="mt-8">
            <HealthTrends profileId={profile.id} />
          </div>
        )}

        {/* Map Area */}
        <div className="mt-8 pb-10">
           <ClinicMap />
        </div>

      </div>
  )
}
