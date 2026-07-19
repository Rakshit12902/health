import React from 'react'
import { Sidebar } from '@/components/Sidebar/Sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] p-6 gap-6">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  )
}
