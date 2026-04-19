'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ScrollText, Flower2, Loader2, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function InquiryChatClient({ 
  initialMessages, 
  conversationId,
  title
}: { 
  initialMessages: any[], 
  conversationId: string,
  title?: string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentId, setCurrentId] = useState(conversationId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversationId: currentId })
      })

      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      
      // If was new, we update the URL without refreshing page
      if (currentId === 'new' && data.id) {
        setCurrentId(data.id)
        window.history.replaceState(null, '', `/inquiry/${data.id}`)
      }
      
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Forgive me, seeker. The archive is currently unavailable. Please try again later.' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Parse Gita verse quotes for formatting
  const formatMarkdownLike = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Very basic formatting for verses if they start with quotes or specify Chapter
      const isVerse = line.includes('Chapter') && line.includes('Verse') || line.match(/^"[^"]+"$/)
      return (
        <p key={i} className={clsx("mb-4", isVerse && "gita-verse my-6")}>
          {line}
        </p>
      )
    })
  }

  return (
    <div className="fixed inset-0 md:left-64 z-20 flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 border-b border-[var(--color-blue-glow)]/20 bg-card-bg/50 backdrop-blur flex items-center justify-between z-10 shrink-0 glow-box-blue">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 text-foreground/50 hover:text-[var(--color-gold)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="font-heading text-lg text-[var(--color-gold)] glow-text">
              {title || (currentId === 'new' ? 'New Conversation' : 'Chatting...')}
            </h2>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-1000 max-w-lg mx-auto">
             <div className="w-20 h-20 rounded-full bg-[var(--color-gold)]/5 flex items-center justify-center border border-[var(--color-gold)]/20 shadow-[0_0_50px_rgba(201,168,76,0.1)] glow-box-amber">
               <ScrollText className="w-10 h-10 text-[var(--color-gold)] glow-text" />
             </div>
             <p className="font-body text-xl text-foreground/90 leading-relaxed font-medium">
               "Hi there. I'm GitaVerse, your inner guide. Tell me what's on your mind today."
             </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-8 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                  {msg.role === 'assistant' ? (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 shadow-sm">
                      <Flower2 className="w-5 h-5 text-[var(--color-gold)]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10">
                      <span className="font-heading text-sm text-foreground/70 uppercase">You</span>
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={clsx(
                  "px-6 py-4 rounded-2xl font-body leading-relaxed text-[1.05rem]",
                  msg.role === 'user' 
                    ? "bg-[#1f2937] text-gray-100 border border-[var(--color-gold)]/20 rounded-tr-sm" 
                    : "bg-card-bg text-foreground border border-[var(--color-gold)]/10 rounded-tl-sm shadow-sm"
                )}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-p:leading-relaxed max-w-none text-foreground/90">
                      {formatMarkdownLike(msg.content)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-4 max-w-[85%]"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/5 flex items-center justify-center border border-[var(--color-gold)]/10 shrink-0">
                <Loader2 className="w-5 h-5 text-[var(--color-gold)] animate-spin" />
              </div>
              <div className="px-6 py-4 rounded-2xl bg-card-bg border border-[var(--color-gold)]/5 rounded-tl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]/50 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]/50 animate-bounce delay-75" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]/50 animate-bounce delay-150" />
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t border-[var(--color-blue-glow)]/10 shrink-0 glow-box-blue">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-card-bg border border-[var(--color-gold)]/20 rounded-xl p-2 focus-within:border-[var(--color-gold)]/60 transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(226,179,74,0.1)]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 px-4 font-body text-foreground placeholder:text-foreground/30 leading-relaxed"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[var(--color-gold)] text-[#2c1810] rounded-lg hover:bg-[var(--color-gold)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 m-1"
            >
              <Send size={18} className={clsx(input.trim() && !isLoading ? "ml-1" : "")} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-foreground/40 font-body tracking-wider">Thoughtful advice guided by the Gita. Allow for moments of reflection.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
