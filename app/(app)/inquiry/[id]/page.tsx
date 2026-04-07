import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import InquiryChatClient from './chat-client'

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (id === 'new') {
    return <InquiryChatClient initialMessages={[]} conversationId="new" />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Verify conversation belongs to user
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (convError || !conversation) {
    redirect('/dashboard')
  }

  // Load message history
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content, timestamp')
    .eq('conversation_id', id)
    .order('timestamp', { ascending: true })

  return <InquiryChatClient initialMessages={messages || []} conversationId={id} title={conversation.title} />
}
