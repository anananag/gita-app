'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Flower2, Save, Loader2, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

const FOCUS_AREAS = [
  'Duty', 
  'Detachment', 
  'Devotion', 
  'Self-Knowledge', 
  'Courage', 
  'Equanimity'
]

export default function ProfilePage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setMemberSince(new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, focus_areas')
          .eq('id', user.id)
          .single()
          
        if (profile) {
          setUsername(profile.username || user.user_metadata?.username || '')
          setFocusAreas(profile.focus_areas || [])
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [supabase])

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, focusAreas })
      })
      
      if (!res.ok) throw new Error('Failed to update')
      setMessage('Your path has been aligned.')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error(error)
      setMessage('Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-gold)]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col items-center border-b border-[var(--color-gold)]/10 pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 mb-6 relative">
          <User className="w-10 h-10 text-[var(--color-gold)]" />
          <div className="absolute -bottom-2 -right-2 bg-background border border-[var(--color-gold)] rounded-full p-1">
             <Flower2 className="w-4 h-4 text-[var(--color-gold)]" />
          </div>
        </div>
        <h1 className="text-3xl font-heading text-[var(--color-gold)] uppercase tracking-widest">
          Sacred Profile
        </h1>
        <p className="font-body text-foreground/60 italic mt-2">
          Seeker since {memberSince}
        </p>
      </div>

      <div className="bg-card-bg border border-[var(--color-gold)]/20 p-8 rounded-2xl space-y-8 shadow-sm">
        <div className="space-y-4">
          <label className="block text-sm font-heading tracking-widest uppercase text-[var(--color-gold)]/80">
            Seeker Name
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-background border border-[var(--color-gold)]/20 focus:border-[var(--color-gold)] rounded-lg py-3 px-4 outline-none transition-colors font-body text-foreground"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-heading tracking-widest uppercase text-foreground/50">
            Archive ID (Email)
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-background/30 border border-transparent rounded-lg py-3 px-4 text-foreground/50 font-body cursor-not-allowed"
          />
        </div>

        <div className="space-y-6 pt-4 border-t border-[var(--color-gold)]/10">
          <label className="block text-sm font-heading tracking-widest uppercase text-[var(--color-gold)]/80">
            Spiritual Focus Areas
          </label>
          <p className="text-xs text-foreground/60 font-body italic mb-4">
            Select areas of inquiry to ground your guidance.
          </p>
          
          <div className="flex flex-wrap gap-3">
            {FOCUS_AREAS.map(area => {
              const isActive = focusAreas.includes(area)
              return (
                <button
                  key={area}
                  onClick={() => toggleFocusArea(area)}
                  className={clsx(
                    "px-4 py-2 rounded-full font-body text-sm border transition-all duration-300",
                    isActive 
                      ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(201,168,76,0.15)]" 
                      : "bg-background border-[var(--color-gold)]/20 text-foreground/70 hover:border-[var(--color-gold)]/50"
                  )}
                >
                  {area}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-8 flex items-center justify-between border-t border-[var(--color-gold)]/10">
          <div>
            {message && (
              <span className="flex items-center gap-2 text-sm text-[var(--color-gold)] animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--color-gold)] text-[#2c1810] px-8 py-3 rounded-lg font-heading uppercase tracking-widest hover:bg-[var(--color-gold)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Embrace Changes
          </button>
        </div>
      </div>
    </div>
  )
}
