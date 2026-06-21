import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let { messages } = await request.json();
    
    // Input Validation: cap array length and truncate strings
    if (!Array.isArray(messages)) messages = [];
    messages = messages.slice(-20).map(msg => ({
      ...msg,
      content: msg.content ? String(msg.content).substring(0, 300) : ""
    }));

    const systemPrompt = `You are EcoBot, a carbon footprint calculator. Based on the user's conversational responses about their day, calculate their carbon emissions AND how much they saved compared to high-emission alternatives.

Return ONLY a JSON object with:
- transport_co2 (number): actual transport emissions in kg CO2e
- food_co2 (number): actual food emissions in kg CO2e
- energy_co2 (number): actual energy emissions in kg CO2e
- shopping_co2 (number): actual shopping emissions in kg CO2e
- total_co2 (number): sum of above
- co2_saved (number): total kg CO2e the user AVOIDED by their eco-friendly choices. Calculate this by comparing each action to its high-emission alternative (e.g. biking vs driving, veggie vs meat, low vs high packaging). If user drove a car, their transport savings are low. If they biked/walked, savings are high.
- breakdown (string): explanation of each category
- tips (array of 2 strings with quick improvement suggestions)

All values in kg CO2e. Be precise based on what they described. No markdown formatting, just the raw JSON string.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(content);

    // Output Validation: clamp values between 0 and 5000
    const clamp = (val) => Math.max(0, Math.min(Number(val) || 0, 5000));
    result.transport_co2 = clamp(result.transport_co2);
    result.food_co2 = clamp(result.food_co2);
    result.energy_co2 = clamp(result.energy_co2);
    result.shopping_co2 = clamp(result.shopping_co2);
    result.total_co2 = clamp(result.total_co2);
    result.co2_saved = clamp(result.co2_saved);

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error in calculator route:', err);
    return NextResponse.json({ error: 'Failed to calculate footprint', details: err.message }, { status: 500 });
  }
}
