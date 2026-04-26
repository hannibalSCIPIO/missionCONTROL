import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_XAI_API_KEY'
    },
    body: JSON.stringify({
      model: 'grok-2-1212',
      messages: [
        { role: 'system', content: 'You are a neutral news assistant. Provide factual, unbiased news headlines. No political spin.' },
        { role: 'user', content: prompt || 'Provide exactly 10 top world news headlines. Just list them as numbered items 1-10. No descriptions, no analysis - just the headlines.' }
      ],
      max_tokens: 500
    })
  });

  const data = await response.json();
  return NextResponse.json(data);
}