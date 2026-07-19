import React, { Suspense } from 'react'
import { ChatUI } from '@/components/Chat/ChatUI'

export default function ChatPage() {
  return (
    <div className="flex-1 flex relative overflow-hidden h-full rounded-2xl glass-panel">
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        <Suspense fallback={<div className="flex-1 p-4">Loading chat...</div>}>
          <ChatUI />
        </Suspense>
      </div>
    </div>
  )
}
