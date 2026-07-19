'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Bell, Shield, Key, Clock, Calendar, Droplets } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  
  // Profile fields
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setName(user.user_metadata?.full_name || '')
        setUserId(user.id)
        
        // Fetch profile
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
        if (data) {
          if (data.age) setAge(data.age.toString())
          if (data.gender) setGender(data.gender)
          if (data.blood_group) setBloodGroup(data.blood_group)
        }
      }
    }
    fetchUser()
  }, [supabase])

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true)
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/chat/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          blood_group: bloodGroup || null
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      router.push('/dashboard')
      router.refresh()
      return; // Do not call setIsSaving(false) after navigation
    } catch (e: any) {
      console.error("Detailed handleSave error:", e)
      alert("Failed to update profile: " + (e.message || "Unknown error"))
      setIsSaving(false)
    }
  }

  const [activeTab, setActiveTab] = useState('Profile Details')

  const tabs = [
    { id: 'Profile Details', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Privacy & Security', icon: Shield },
    { id: 'Billing (Premium)', icon: Key }
  ]

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation / Tabs */}
        <div className="col-span-1 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-cyan)] border border-[var(--color-accent-blue)]/50 shadow-[0_0_10px_var(--color-accent-glow)]' 
                    : 'text-[var(--color-text-muted)] hover:text-white border border-transparent'
                }`}
              >
                <tab.icon size={18} /> {tab.id}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-2 space-y-6 pb-20">
          <div className="glass-panel p-6 min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-6">{activeTab}</h3>
            
            {activeTab === 'Profile Details' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--color-accent-blue)] to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-[var(--color-bg-secondary)] border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors text-white">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={name}
                        readOnly
                        className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none opacity-70 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        readOnly
                        className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none opacity-70 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-medium text-white mt-8 mb-4 border-b border-white/10 pb-2">Health Metrics</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Age</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                        <Calendar size={18} />
                      </div>
                      <input 
                        type="number" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 35"
                        className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Gender</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                        <User size={18} />
                      </div>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Blood Group</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                        <Droplets size={18} />
                      </div>
                      <select 
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors appearance-none"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-cyan)] text-white font-medium rounded-lg transition-colors shadow-[0_0_15px_var(--color-accent-glow)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'Profile Details' && (
              <div className="flex flex-col items-center justify-center h-48 text-center animate-in fade-in duration-300">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
                   <Clock size={24} />
                 </div>
                 <h4 className="text-lg font-medium text-white mb-2">Coming Soon</h4>
                 <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
                   The {activeTab} settings panel is currently under development. Please check back later.
                 </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
