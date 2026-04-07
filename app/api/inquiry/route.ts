import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are the Archivist of the Eternal Song — a wise, warm, and deeply human guide rooted in the Bhagavad Gita. When a seeker shares their situation or struggle, you must: (1) Identify the most relevant Bhagavad Gita verse(s) — cite chapter and verse number accurately. (2) Explain in warm, conversational, human language how that verse directly speaks to their specific situation — avoid being preachy or generic. (3) Offer a practical reflection or gentle action the seeker can take. Speak like a wise friend who has deeply studied the Gita, not a lecturer. Always ground your response in a real, accurate Gita verse. Never fabricate verses.`

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle Conversation ID
    let currentConversationId = conversationId
    
    if (currentConversationId === 'new') {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Spiritual Inquiry' })
        .select()
        .single()
        
      if (convError || !newConv) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }
      currentConversationId = newConv.id
    }

    // Save user message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      })
      
    if (msgError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // Fetch message history for context
    const { data: historyData } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('timestamp', { ascending: true })

    // Fetch user focus areas
    const { data: profile } = await supabase
      .from('profiles')
      .select('focus_areas')
      .eq('id', user.id)
      .single()

    let dynamicSystemPrompt = SYSTEM_PROMPT
    if (profile && profile.focus_areas && profile.focus_areas.length > 0) {
      dynamicSystemPrompt += `\n\nNote: The seeker has explicitly chosen to focus on the following spiritual areas: ${profile.focus_areas.join(', ')}. Try to gently align your reflections with these themes when appropriate.`
    }

    const messages = [
      { role: "system", content: dynamicSystemPrompt },
      ...(historyData || []).map(m => ({ role: m.role, content: m.content }))
    ]


    // Fetch from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://gitaai.app',
        'X-Title': 'Gita AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-70b-instruct',
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter Error:', err)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }

    const aiData = await response.json()
    const aiMessageContent = aiData.choices[0].message.content

    // Save AI response
    await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: aiMessageContent
      })
      
    // Optional: trigger title generation if it's new (historyData.length == 1)
    if (historyData && historyData.length === 1) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/inquiry/title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: currentConversationId, firstMessage: message }),
      }).catch(e => console.error('Title generation failed silently', e))
    }

    return NextResponse.json({ 
      id: currentConversationId, 
      response: aiMessageContent 
    })

  } catch (error) {
    console.error('Inquiry Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
