'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadArea } from "@/components/Upload/UploadArea"
import { ClinicMap } from "@/components/Map/ClinicMap"
import { Activity, User as UserIcon, Droplets, Calendar, FileText } from "lucide-react"

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('User')
  
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
        try {
          const res = await fetch(`http://localhost:8000/api/chat/profile?user_id=${user.id}`);
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
          <button className="glass-panel p-2 text-[var(--color-accent-cyan)] hover:text-white transition-colors">
            <Activity size={24} />
          </button>
        </header>

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

        {/* Upload Area */}
        <div className="mt-8">
           <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
             <FileText size={24} className="text-[var(--color-accent-cyan)]" /> Analyze New Report
           </h2>
           <UploadArea />
        </div>

        {/* Map Area */}
        <div className="mt-8 pb-10">
           <ClinicMap />
        </div>

      </div>
  )
}
