import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Flower2, Plus } from 'lucide-react'

// Hardcoded list of famous verses
const quotes = [
  "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. — Chapter 2, Verse 47",
  "A person is said to be established in self-realization and is called a yogi when they are fully satisfied by virtue of acquired knowledge and realization. — Chapter 6, Verse 8",
  "Whatever action a great man performs, common men follow. — Chapter 3, Verse 21",
  "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy. — Chapter 6, Verse 6",
  "There is neither this world nor the world beyond nor happiness for the one who doubts. — Chapter 4, Verse 40"
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch latest 3 conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3)
    
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col items-center text-center space-y-6 mb-16">
        <Flower2 className="w-12 h-12 text-[var(--color-gold)] mb-4" />
        <h1 className="text-4xl md:text-5xl font-heading text-[var(--color-gold)] tracking-wide">
          Seek eternal truth within.
        </h1>
        <p className="max-w-2xl text-lg font-body italic text-foreground/80 leading-relaxed gita-verse border-l-0 border-b pb-4 border-[var(--color-gold)]/30">
          {randomQuote}
        </p>
      </div>

      <div className="flex justify-center mb-16">
        <Link 
          href={`/inquiry/new`}
          className="group relative bg-[#131821] border border-[var(--color-gold)]/30 p-8 rounded-2xl flex flex-col items-center gap-4 hover:border-[var(--color-gold)] transition-colors w-full max-w-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-[var(--color-gold)]" />
          </div>
          <span className="relative z-10 font-heading text-xl text-[var(--color-gold)] uppercase tracking-widest text-center">
            Start a New Contemplation
          </span>
        </Link>
      </div>

      {conversations && conversations.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-heading text-xl text-foreground/90 uppercase tracking-widest text-center border-b border-[var(--color-gold)]/10 pb-4">
            Past Wisdom
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {conversations.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/inquiry/${conv.id}`}
                className="bg-card-bg border border-[var(--color-gold)]/10 p-6 rounded-xl hover:border-[var(--color-gold)]/50 transition-colors flex flex-col h-full"
              >
                <h3 className="font-heading text-lg text-[var(--color-gold)] truncate mb-2">
                  {conv.title}
                </h3>
                <p className="text-xs text-foreground/50 font-body uppercase tracking-wider mt-auto pt-4 flex justify-between items-center">
                  <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                  <span className="text-[var(--color-gold)]/70">→</span >
                </p>
              </Link>
            ))}
          </div>
          
          {conversations.length === 3 && (
            <div className="flex justify-center mt-6">
              <Link href="/archive" className="text-sm font-heading uppercase tracking-widest text-[var(--color-gold)]/80 hover:text-[var(--color-gold)] transition-colors">
                View Entire Archive
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
