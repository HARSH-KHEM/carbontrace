import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
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

  // 1. Get the current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch last 7 days of activity data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (activityError) {
      console.error('Error fetching activity logs:', activityError);
    }

    // 3. Fetch profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // 4. Send to Grok API
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
          {
            role: 'system',
            content: 'You are a carbon footprint coach. Based on the user activity data provided, generate exactly 3 personalized actionable tips to reduce their carbon footprint. Return ONLY a valid JSON array with exactly 3 objects, each with: title (max 8 words), description (2 sentences), category (one of: transport, food, energy, shopping), impact (one of: high, medium, low). No preamble, no markdown, just the raw JSON array.'
          },
          {
            role: 'user',
            content: `User activity data: ${JSON.stringify(activityData || [])}. User profile: ${JSON.stringify(profileData || {})}. Generate 3 personalized carbon reduction tips.`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let tipsContent = data.choices[0].message.content;
    
    // Clean up potential markdown formatting from the response
    if (tipsContent.startsWith('```json')) {
      tipsContent = tipsContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (tipsContent.startsWith('```')) {
      tipsContent = tipsContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const tips = JSON.parse(tipsContent);

    // 5. Cache response in insights table
    const inserts = tips.map((tip, index) => ({
      user_id: user.id,
      title: tip.title,
      description: tip.description,
      category: tip.category,
      impact: tip.impact,
      icon: tip.category === 'transport' ? 'directions_car' :
            tip.category === 'food' ? 'restaurant' :
            tip.category === 'energy' ? 'bolt' :
            tip.category === 'shopping' ? 'shopping_bag' : 'eco',
      is_featured: index === 0, // make the first tip featured
      is_completed: false
    }));

    const { data: insertedTips, error: insertError } = await supabase
      .from('insights')
      .insert(inserts)
      .select();

    if (insertError) {
      console.error('Error saving insights to Supabase:', insertError);
      // Fallback to returning the un-cached tips
      return NextResponse.json(tips);
    }

    // 6. Return the tips
    return NextResponse.json(insertedTips);

  } catch (err) {
    console.error('Error in insights route:', err);
    return NextResponse.json({ error: 'Failed to generate insights', details: err.message }, { status: 500 });
  }
}
