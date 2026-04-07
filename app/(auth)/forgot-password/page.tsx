'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Key, Book, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  return (
    <div className="bg-card-bg border border-[var(--color-gold-muted)] p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-heading font-medium tracking-widest text-[var(--color-gold)] text-center uppercase">
          Forgotten Path
        </h1>
        <p className="text-muted-foreground italic mt-2 text-center text-sm font-body">
          Retrieve your access to the archive
        </p>
      </div>

      {!success ? (
        <form onSubmit={handleReset} className="space-y-6">
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground text-[var(--color-gold)]/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seeker ID (Email)"
                required
                className="w-full bg-background/50 border border-[var(--color-gold)]/20 focus:border-[var(--color-gold)] rounded-lg py-3 pl-10 pr-4 outline-none transition-colors font-body text-foreground placeholder:text-foreground/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--color-gold)] rounded-lg py-3 font-medium text-[#2c1810] flex items-center justify-center gap-2 hover:bg-[var(--color-gold)]/90 transition-colors uppercase tracking-wider font-heading"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Book className="w-5 h-5" />
                Send Reset Link
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500/80" />
          </div>
          <p className="text-foreground/80 font-body">
            If an account exists, a reset link has been sent to your email.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-[var(--color-gold)]/10 flex flex-col items-center gap-4 text-sm font-body">
        <Link href="/login" className="text-foreground/70 hover:text-[var(--color-gold)] transition-colors uppercase tracking-wider text-xs">
          Return to Entrance
        </Link>
      </div>
    </div>
  )
}
