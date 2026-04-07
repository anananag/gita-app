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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[var(--color-blue-glow)]/10 via-[var(--color-amber)]/5 to-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
