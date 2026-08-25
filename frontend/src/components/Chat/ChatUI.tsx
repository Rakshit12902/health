'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, Paperclip, StopCircle, Square, Copy, RefreshCw, Check, Loader2, FileText, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'

export function ChatUI() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session')
  const documentId = searchParams.get('doc')
  
  const [messages, setMessages] = useState<{id: string, role: 'user' | 'ai', content: string}[]>([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const ignoreNextAbortRef = useRef(false)
  const isCreatingSessionRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionId) {
      if (isCreatingSessionRef.current) {
         isCreatingSessionRef.current = false
      } else {
         fetchMessages(sessionId)
      }
    } else {
      setMessages([{ id: '1', role: 'ai', content: 'Hello! I am CuraMind. Upload your medical report or ask me a question.' }])
    }
    // Cleanup audio and fetch on unmount
    return () => {
      stopAudio()
      if (ignoreNextAbortRef.current) {
        ignoreNextAbortRef.current = false
      } else if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [sessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async (sid: string) => {
    setLoadingHistory(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/chat/sessions/${sid}/messages`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.sender_type as 'user' | 'ai',
          content: m.content
        })))
      } else {
        setMessages([{ id: '1', role: 'ai', content: 'Hello! I am CuraMind. I am ready to assist you in this new chat.' }])
      }
    } catch (e) {
      console.error("Failed to fetch messages", e)
    } finally {
      setLoadingHistory(false)
    }
  }

  // --- Audio / Avatar Control ---
  const stopAudio = () => {
    window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }

  const handleAvatarClick = () => {
    if (isSpeaking) stopAudio()
  }

  const playTTS = (text: string) => {
    stopAudio() // Stop any currently playing audio first
    
    // Clean text: remove emojis and markdown before speaking
    const cleanText = text
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '') 
      .replace(/[\*#_~`]/g, '') 
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS error:", e)
      setIsSpeaking(false)
    }
  }

  // --- Recording Control ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await handleAudioUpload(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Could not access microphone.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleAudioUpload = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('file', blob, 'voice.wav')

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/voice/transcribe`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.text) {
        setInput(data.text)
      }
    } catch (e) {
      console.error("Transcription error:", e)
    }
  }

  // --- File Upload Control ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // If no session, create one first or alert user
    if (!sessionId) {
      alert("Please start a 'New Chat' first before uploading documents here.")
      return
    }

    setIsUploading(true)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    let uploadedDocIds: string[] = [];
    
    try {
      // Upload all files concurrently
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('session_id', sessionId)
        
        const response = await fetch(`${baseUrl}/api/documents/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
        const data = await response.json();
        if (data.document_id) {
            return data.document_id;
        }
        throw new Error("No document ID");
      });
      
      const docIds = await Promise.all(uploadPromises);
      uploadedDocIds = docIds.filter(id => id !== undefined);
      
      // Poll for status of all docs
      if (uploadedDocIds.length > 0) {
        pollMultipleDocumentsStatus(uploadedDocIds, sessionId);
      } else {
        setIsUploading(false);
      }
      
    } catch (err) {
      console.error("Upload failed", err)
      alert("Failed to upload documents. The server might have encountered an error.")
      setIsUploading(false)
    }
    
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const pollMultipleDocumentsStatus = async (docIds: string[], sid: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let completedCount = 0;
    let failedCount = 0;
    
    const interval = setInterval(async () => {
      try {
        let allDone = true;
        
        for (const docId of docIds) {
            const res = await fetch(`${baseUrl}/api/documents/${docId}/status`);
            const data = await res.json();
            if (data.processing_status !== 'completed' && data.processing_status !== 'failed') {
                allDone = false;
                break;
            }
        }
        
        if (allDone) {
            clearInterval(interval);
            setIsUploading(false);
            
            // Just push the last doc to URL for simplicity, but the backend can fetch all session docs
            const lastDocId = docIds[docIds.length - 1];
            window.history.replaceState({}, '', `/chat?session=${sid}&doc=${lastDocId}`);
            
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'ai',
              content: `📄 I've successfully analyzed your ${docIds.length} document(s). What would you like to know about them?`
            }]);
        }
      } catch (e) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 2000);
  }

  const pollDocumentStatus = async (docId: string, sid: string) => {
    // Kept for backward compatibility if needed
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/api/documents/${docId}/status`);
        const data = await res.json();
        if (data.processing_status === 'completed' || data.processing_status === 'failed') {
          clearInterval(interval);
          setIsUploading(false);
          if (data.processing_status === 'completed') {
            window.history.replaceState({}, '', `/chat?session=${sid}&doc=${docId}`);
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'ai',
              content: `📄 I've successfully analyzed your document. What would you like to know about it?`
            }]);
          } else {
             alert("Document processing failed. Please try again.")
          }
        }
      } catch (e) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 2000);
  }

  // --- Chat Stream Control ---
  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return
    
    stopAudio() // Stop TTS when sending a new message
    
    const userMsgId = crypto.randomUUID()
    const aiMsgId = crypto.randomUUID()
    
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: messageText }])
    if (messageText === input) setInput('')
    setIsGenerating(true)
    
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }])

    let fullAiResponse = ""
    abortControllerRef.current = new AbortController()

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let activeSessionId = sessionId;
      
      // Auto-create session if it doesn't exist
      if (!activeSessionId) {
        // Fetch user id from Supabase to create session
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
           const createRes = await fetch(`${baseUrl}/api/chat/sessions?user_id=${user.id}&title=${encodeURIComponent(messageText.substring(0, 30))}`, {
             method: 'POST'
           });
           const newSession = await createRes.json();
           if (newSession && newSession.id) {
             activeSessionId = newSession.id;
             // Update URL silently
             ignoreNextAbortRef.current = true;
             isCreatingSessionRef.current = true;
             window.history.replaceState({}, '', `/chat?session=${activeSessionId}`);
           }
        }
        
        if (!activeSessionId) {
          throw new Error("Could not create session");
        }
      }

      const response = await fetch(`${baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSessionId, 
          message: messageText,
          language: 'en',
          document_id: documentId || undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (!dataStr.trim()) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                fullAiResponse += data.token
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMsgId ? { ...msg, content: msg.content + data.token } : msg
                ));
              }
              if (data.error) {
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMsgId ? { ...msg, content: "Error: " + data.error } : msg
                ));
                setIsGenerating(false);
              }
              if (data.event === 'done') {
                setIsGenerating(false);
              }
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Generation aborted")
        // Optionally play TTS for what was generated so far
        if (fullAiResponse.trim()) playTTS(fullAiResponse)
      } else {
        console.error("Chat error:", error);
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, content: 'Sorry, I encountered an error connecting to the server.' } : msg
        ));
      }
      setIsGenerating(false)
    } finally {
      abortControllerRef.current = null
    }
  }

  const handleStopGenerate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRegenerate = (index: number) => {
    // Find the last user message before this AI message
    let lastUserMsg = ""
    for (let i = index; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMsg = messages[i].content
        break
      }
    }
    if (lastUserMsg) {
      handleSend(lastUserMsg)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      {/* Top: Avatar Area */}
      <div className="h-32 flex flex-col items-center justify-center border-b border-white/5 relative">
        <div className="relative flex items-center justify-center w-24 h-24">
          {isSpeaking && (
            <>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-cyan)]"
              />
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0 rounded-full border border-[var(--color-accent-blue)]"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[var(--color-accent-cyan)] blur-xl"
              />
            </>
          )}
          
          <motion.div 
            onClick={handleAvatarClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isSpeaking ? {
              boxShadow: [
                "0 0 20px var(--color-accent-glow)",
                "0 0 50px var(--color-accent-cyan)",
                "0 0 20px var(--color-accent-glow)"
              ]
            } : {
              scale: [1, 1.05, 1],
              boxShadow: "0 0 15px var(--color-accent-glow)"
            }}
            transition={{
              duration: isSpeaking ? 1 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] flex items-center justify-center relative z-10 ${isSpeaking ? 'cursor-pointer' : ''}`}
          >
             <div className="w-12 h-12 rounded-full bg-[var(--color-bg-primary)] opacity-80 flex items-center justify-center">
               {isSpeaking && <Square size={14} className="text-[var(--color-accent-cyan)]" fill="currentColor" />}
             </div>
          </motion.div>
        </div>
        {isSpeaking && (
            <div className="absolute bottom-2 text-xs text-[var(--color-accent-cyan)] animate-pulse">Tap avatar to stop speaking</div>
        )}
      </div>

      {/* Middle: Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 relative ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] text-white shadow-[0_0_15px_var(--color-accent-glow)]' 
                : 'glass-panel border-l-4 border-l-[var(--color-accent-cyan)] pr-12 pb-6'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              
              {/* Message Actions (ChatGPT style) */}
              {msg.role === 'ai' && msg.content && (
                <div className="absolute -bottom-3 right-4 flex items-center gap-1 bg-[var(--color-bg-secondary)] border border-white/10 rounded-lg p-1 shadow-lg">
                  <button 
                    onClick={() => isSpeaking ? stopAudio() : playTTS(msg.content)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors rounded-md hover:bg-white/5"
                    title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                  >
                    {isSpeaking ? <Square size={14} className="text-[var(--color-danger)]" fill="currentColor" /> : <Volume2 size={14} />}
                  </button>
                  <button 
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors rounded-md hover:bg-white/5"
                    title="Copy"
                  >
                    {copiedId === msg.id ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
                  </button>
                  <button 
                    onClick={() => handleRegenerate(index)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors rounded-md hover:bg-white/5"
                    title="Regenerate"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
             <div className="glass-panel border-l-4 border-l-[var(--color-accent-cyan)] p-4 rounded-2xl flex items-center gap-2">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                 <Loader2 size={16} className="text-[var(--color-accent-cyan)]" />
               </motion.div>
               <span className="text-sm text-[var(--color-text-muted)]">CuraMind is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {/* Full screen upload overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm rounded-3xl"
            >
              <div className="glass-panel p-8 rounded-2xl flex flex-col items-center border border-[var(--color-accent-cyan)]/30 shadow-[0_0_30px_var(--color-accent-glow)]">
                 <div className="relative mb-4">
                   <div className="w-16 h-16 border-4 border-white/10 border-t-[var(--color-accent-cyan)] rounded-full animate-spin"></div>
                   <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-accent-cyan)] opacity-70" size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Analyzing Reports</h3>
                 <p className="text-sm text-[var(--color-text-muted)] max-w-[200px] text-center">
                   Extracting medical data and preparing insights...
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Input Area */}
      <div className="p-4 border-t border-white/5 bg-[var(--color-bg-primary)]/80 backdrop-blur-md">

        <div className="glass-panel flex items-center p-2 rounded-full border border-white/10 shadow-lg relative focus-within:border-[var(--color-accent-cyan)]/50 focus-within:shadow-[0_0_15px_var(--color-accent-glow)] transition-all">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf" 
            multiple
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors disabled:opacity-50"
            title="Attach a report"
          >
            <Paperclip size={20} />
          </button>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Message CuraMind..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder-[var(--color-text-muted)] text-sm"
          />

          {isGenerating ? (
            <button 
              onClick={handleStopGenerate}
              className="p-3 ml-2 text-white bg-[var(--color-text-muted)] hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
              title="Stop generating"
            >
              <Square fill="currentColor" size={16} />
            </button>
          ) : isRecording ? (
            <button 
              onClick={stopRecording}
              className="p-3 ml-2 text-white bg-[var(--color-danger)]/80 hover:bg-[var(--color-danger)] animate-pulse rounded-full transition-colors"
            >
              <StopCircle size={20} />
            </button>
          ) : (
            <>
              <button 
                onClick={startRecording}
                className="p-3 text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors rounded-full"
                title="Voice input"
              >
                <Mic size={20} />
              </button>
              
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="p-3 ml-1 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_var(--color-accent-glow)]"
              >
                <Send size={18} />
              </button>
            </>
          )}
        </div>
        <div className="text-center mt-2 text-[10px] text-[var(--color-text-muted)]">
          CuraMind can make mistakes. Always consult a healthcare professional.
        </div>
      </div>
    </div>
  )
}
