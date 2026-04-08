import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome - GitaVerse',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-[var(--color-blue-glow)]/20 via-[var(--color-amber)]/10 to-[var(--color-gold)]/15 rounded-full blur-[100px] pointer-events-none opacity-80 dark:opacity-100" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
