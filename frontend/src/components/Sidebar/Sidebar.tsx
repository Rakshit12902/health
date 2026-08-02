'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, LayoutDashboard, Settings, LogOut, PlusCircle, Trash2, Pill, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ChatSession {
  id: string
  title: string
  created_at: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get('session')
  const supabase = createClient()
  
  const [userName, setUserName] = useState('User')
  const [userId, setUserId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
      }
    }
    fetchUser()
  }, [supabase.auth])

  useEffect(() => {
    if (userId) {
      fetchSessions()
    }
  }, [userId, currentSessionId]) // Re-fetch if session ID changes (new chat created)

  const fetchSessions = async () => {
    setLoadingHistory(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/chat/sessions?user_id=${userId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setSessions(data)
      }
    } catch (e) {
      console.error("Error fetching sessions:", e)
    }
    setLoadingHistory(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          router.push('/chat');
        }
      } else {
        alert('Failed to delete chat.');
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
  ]
  
  // Helper to close mobile menu after navigation
  const handleNavClick = () => {
    if (isMobileOpen) setIsMobileOpen(false);
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-accent-blue)]/50 rounded-lg text-white shadow-lg backdrop-blur-md"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-[var(--color-bg-primary)]/80 z-40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 h-full
        glass-panel flex flex-col border-r border-white/5 transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20 p-3' : 'w-64 p-4'}
      `}>
         
         {/* Desktop Collapse Toggle */}
         <button 
           className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-[var(--color-bg-secondary)] border border-white/10 rounded-full items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)] hover:border-[var(--color-accent-cyan)]/50 transition-colors z-50 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
           onClick={() => setIsCollapsed(!isCollapsed)}
         >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
         </button>

         {/* Mobile Close Button */}
         <button 
           className="md:hidden absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-white"
           onClick={() => setIsMobileOpen(false)}
         >
           <X size={20} />
         </button>

         {/* Logo */}
         <div className="mb-6 flex items-center justify-center h-8">
           <Link href="/dashboard" onClick={handleNavClick} className={`font-bold text-white hover:text-[var(--color-accent-cyan)] transition-colors truncate flex items-center ${isCollapsed ? 'text-xl' : 'text-xl w-full'}`}>
             {isCollapsed ? 'CM' : 'CuraMind'}
           </Link>
         </div>
         
         {/* New Chat Button */}
         <Link href="/chat" onClick={handleNavClick}>
           <button className={`flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] rounded-xl text-white font-medium shadow-[0_0_15px_var(--color-accent-glow)] hover:opacity-90 transition-all mb-6 ${isCollapsed ? 'w-12 h-12 rounded-full p-0 mx-auto' : 'w-full'}`}>
             <PlusCircle size={18} />
             {!isCollapsed && <span>New Chat</span>}
           </button>
         </Link>
         
         <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           {/* Main Navigation */}
           <div className="space-y-1">
             {!isCollapsed && <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">Menu</h3>}
             {navItems.map((item) => {
               const isActive = pathname === item.path
               return (
                 <Link key={item.name} href={item.path} onClick={handleNavClick}>
                   <div className={`p-2.5 rounded-lg font-medium cursor-pointer flex items-center transition-all ${isCollapsed ? 'justify-center' : 'gap-3'} ${
                     isActive 
                       ? 'bg-[var(--color-accent-blue)]/20 text-white border border-[var(--color-accent-blue)]/30' 
                       : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'
                   }`} title={isCollapsed ? item.name : undefined}>
                     <item.icon size={18} className={isActive ? "text-[var(--color-accent-cyan)]" : ""} />
                     {!isCollapsed && <span className="text-sm">{item.name}</span>}
                   </div>
                 </Link>
               )
             })}
           </div>

           {/* Chat History */}
           <div className="flex-1 flex flex-col overflow-hidden">
             {!isCollapsed && <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2 shrink-0">Recent Chats</h3>}
             
             <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
               {loadingHistory ? (
                 <div className="flex justify-center p-4">
                   <div className="w-4 h-4 border-2 border-[var(--color-accent-cyan)] border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : sessions.length === 0 ? (
                 !isCollapsed && <p className="text-xs text-[var(--color-text-muted)] px-2">No past chats.</p>
               ) : (
                 sessions.map(session => (
                   <div key={session.id} className="relative group">
                     <Link 
                       href={`/chat?session=${session.id}`}
                       onClick={handleNavClick}
                       className={`flex items-center p-2.5 rounded-lg transition-all ${isCollapsed ? 'justify-center' : 'gap-3 w-full pr-8'} ${
                         currentSessionId === session.id 
                           ? 'bg-[var(--color-accent-blue)]/20 text-white border border-[var(--color-accent-blue)]/30' 
                           : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'
                       }`}
                       title={isCollapsed ? session.title : undefined}
                     >
                       <MessageSquare size={14} className={currentSessionId === session.id ? "text-[var(--color-accent-cyan)] shrink-0" : "opacity-70 shrink-0"} />
                       {!isCollapsed && (
                         <div className="flex-1 text-left truncate text-sm">
                           {session.title || 'New Chat'}
                         </div>
                       )}
                     </Link>
                     {!isCollapsed && (
                       <button
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleDeleteSession(session.id);
                         }}
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-white/10"
                         title="Delete Chat"
                       >
                         <Trash2 size={14} />
                       </button>
                     )}
                   </div>
                 ))
               )}
             </div>
           </div>
         </div>

         {/* Bottom Profile Area */}
         <div className={`mt-4 pt-4 border-t border-white/5 ${isCollapsed ? 'flex flex-col items-center gap-3' : 'space-y-3'}`}>
           <Link href="/settings" className="block group w-full" onClick={handleNavClick}>
             <div className={`flex items-center p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-[var(--color-accent-cyan)]/50 group-hover:bg-white/10 transition-all cursor-pointer ${isCollapsed ? 'justify-center' : 'gap-3'}`} title={isCollapsed ? "Settings" : undefined}>
                <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-[var(--color-accent-blue)] to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                   {userName.charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-[var(--color-accent-cyan)] transition-colors">{userName}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Settings</p>
                      <Settings size={12} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-cyan)] transition-colors" />
                    </div>
                  </div>
                )}
             </div>
           </Link>

           <button onClick={handleLogout} className={`flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors ${isCollapsed ? 'justify-center p-2 bg-white/5 rounded-xl border border-white/10 w-full' : 'gap-2 text-sm px-2 w-full mt-2'}`} title={isCollapsed ? "Logout" : undefined}>
              <LogOut size={16} /> 
              {!isCollapsed && <span>Logout</span>}
           </button>
         </div>
      </div>
    </>
  )
}
