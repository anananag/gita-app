'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Moon, Sun, ScrollText, BookOpen, User, LogOut, Menu, X, PlusCircle } from 'lucide-react'
import clsx from 'clsx'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [username, setUsername] = useState<string>('Friend')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUsername(user.user_metadata?.username || 'Friend')
      }
    }
    getUser()
    
    // Check dark mode preference
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
  }, [supabase.auth])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Wisdom', href: '/dashboard', icon: BookOpen },
    { name: 'Your Story', href: '/archive', icon: ScrollText },
    { name: 'Account', href: '/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-gold)]/10 glow-box-blue">
        <h1 className="font-heading text-xl text-[var(--color-gold)] tracking-widest uppercase glow-text">GitaVerse</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:sticky top-0 left-0 h-screen w-64 border-r border-[var(--color-gold)]/10 bg-card-bg/80 backdrop-blur-md flex flex-col z-40 transition-transform duration-300 ease-in-out md:translate-x-0 glow-box-blue",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-[var(--color-gold)]/10 hidden md:block">
          <h1 className="font-heading text-3xl text-[var(--color-gold)] tracking-widest uppercase glow-text">GitaVerse</h1>
          <p className="font-body text-xs italic text-foreground/60 mt-1">Talk to someone who gets it.</p>
        </div>

        <div className="p-6 border-b border-[var(--color-gold)]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20">
              <User size={18} className="text-[var(--color-gold)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-body text-sm text-foreground/80">Welcome,</span>
              <span className="font-heading text-lg text-[var(--color-gold)] capitalize">{username}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-heading tracking-wide transition-colors duration-200",
                  isActive 
                    ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20" 
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-[var(--color-gold)]/10">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-heading tracking-wide text-foreground/70 hover:bg-foreground/5 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-heading tracking-wide text-foreground/70 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-[var(--color-blue-glow)]/15 via-[var(--color-amber)]/10 to-[var(--color-gold)]/5 rounded-full blur-[100px] pointer-events-none opacity-60 dark:opacity-100" />
        
        <div className="absolute top-0 right-0 p-4 z-10 hidden md:block">
           <Link href="/dashboard" className="px-4 py-2 border border-[var(--color-gold)]/30 rounded-full text-xs uppercase tracking-widest text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors flex items-center gap-2 font-heading">
             <PlusCircle size={14} />
             New Inquiry
           </Link>
        </div>
        <div className="flex-1 overflow-y-auto relative z-10">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
