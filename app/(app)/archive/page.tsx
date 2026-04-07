import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Scroll } from 'lucide-react'

export default async function ArchivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col items-center border-b border-[var(--color-blue-glow)]/20 pb-8 text-center glow-box-blue rounded-xl bg-[var(--color-blue-glow)]/5">
        <Scroll className="w-10 h-10 text-[var(--color-gold)] mb-4 glow-text" />
        <h1 className="text-3xl font-heading text-[var(--color-gold)] uppercase tracking-widest glow-text">
          Your Story
        </h1>
        <p className="font-body text-foreground/80 mt-2">
          Review your past conversations
        </p>
      </div>

      {(!conversations || conversations.length === 0) ? (
        <div className="text-center py-24 bg-card-bg border border-[var(--color-gold)]/10 rounded-2xl glow-box-amber">
          <p className="font-body text-foreground/70 mb-6 font-medium">You don't have any saved conversations yet.</p>
          <Link 
            href="/inquiry/new" 
            className="inline-flex items-center justify-center bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-[var(--color-gold)] px-6 py-3 rounded-full hover:bg-[var(--color-gold)] hover:text-[#2c1810] transition-colors font-heading tracking-widest uppercase text-sm"
          >
            Start a Conversation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversations.map((conv) => (
            <Link 
              key={conv.id} 
              href={`/inquiry/${conv.id}`}
              className="bg-card-bg border border-[var(--color-gold)]/20 p-6 rounded-xl hover:border-[var(--color-gold)] transition-colors group flex flex-col"
            >
              <h3 className="font-heading text-xl text-foreground group-hover:text-[var(--color-gold)] transition-colors line-clamp-2 mb-4">
                {conv.title}
              </h3>
              <div className="mt-auto flex justify-between items-center text-xs font-body text-foreground/50 uppercase tracking-widest pt-4 border-t border-[var(--color-gold)]/5">
                <span>{new Date(conv.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span className="text-[var(--color-gold)] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
