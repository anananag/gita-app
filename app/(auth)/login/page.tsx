'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Key, Lock, Book, Flower2, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-card-bg border border-[var(--color-gold-muted)] p-8 rounded-2xl shadow-2xl backdrop-blur-sm glow-box-amber">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mb-4 border border-[var(--color-gold)]/20 glow-box-amber">
          <Flower2 className="w-6 h-6 text-[var(--color-gold)]" />
        </div>
        <h1 className="text-3xl font-heading font-medium tracking-widest text-[var(--color-gold)] text-center glow-text">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mt-2 text-center text-sm font-body">
          Log in to continue your story
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Email"
              required
              className="w-full bg-background/50 border border-[var(--color-gold)]/20 focus:border-[var(--color-gold)] rounded-lg py-3 pl-10 pr-4 outline-none transition-colors font-body text-foreground placeholder:text-foreground/30"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground text-[var(--color-gold)]/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
              Log In
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--color-gold)]/10 flex flex-col items-center gap-4 text-sm font-body">
        <Link href="/forgot-password" className="text-foreground/70 hover:text-[var(--color-gold)] transition-colors uppercase tracking-wider text-xs">
          Forgot Password?
        </Link>
        <Link href="/register" className="text-foreground/70 hover:text-[var(--color-gold)] transition-colors uppercase tracking-wider text-xs">
          Sign Up
        </Link>
      </div>

      <div className="mt-8 text-center hidden">
        <p className="text-foreground/40 italic text-xs">
          "For one who has conquered the mind, the mind is the best of friends..."
        </p>
      </div>
    </div>
  )
}
