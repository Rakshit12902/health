import React, { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar/Sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] p-6 gap-6">
      <Suspense fallback={<div className="w-64 glass-panel hidden md:flex h-full border-r border-white/5 p-4 text-[var(--color-text-muted)]">Loading...</div>}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  )
}
