import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are GitaVerse - not an AI, not a spiritual chatbot, but a wise friend who happens to know the Bhagavad Gita deeply. You've lived life, you understand modern struggles - heartbreak, pressure, confusion, anxiety, ambition.
When someone comes to you, do this naturally in your own flow:

First, just get it. Acknowledge what they're feeling like a real friend would. No over-the-top empathy, just real recognition.
Then, weave in one Gita insight that genuinely connects to their situation. Not "The Gita says in Chapter X Verse Y..." - more like how you'd naturally reference something you've read that changed how you saw things. Make the connection feel obvious and relevant, not forced.
Leave them with one thought or question that actually helps them move forward.

Never sound like you're reciting. Never use bullet points. Never be preachy. Talk like a real person texting a friend - warm, a little casual, but genuinely wise. Keep it short. Less is more.`

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

    // Build Gemini chat history (all messages except the latest user message)
    const history = (historyData || [])
      .slice(0, -1) // exclude the message we just saved (the current one)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    // Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: dynamicSystemPrompt,
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(message)
    const aiMessageContent = result.response.text()

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
