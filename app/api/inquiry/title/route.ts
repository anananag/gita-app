import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { conversationId, firstMessage } = await req.json()
    
    if (!conversationId || !firstMessage) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Call OpenRouter to generate title
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
        messages: [
          { role: 'system', content: 'Generate a warm, natural 3-5 word title summarizing this personal conversation/topic based on the user\'s message. Return ONLY the title, nothing else. No quotes, no markdown.' },
          { role: 'user', content: firstMessage }
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    const aiData = await response.json()
    let title = aiData.choices[0].message.content.trim()
    
    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '')

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    // Update title in DB
    await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)

    return NextResponse.json({ title })

  } catch (error) {
    console.error('Title Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
