// app/api/make-call/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { recipientPhoneNumber } = await request.json();

  if (!recipientPhoneNumber) {
    return NextResponse.json({ error: 'Recipient phone number is required.' }, { status: 400 });
  }

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ALERT_ID;
  const agentPhoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;

  if (!elevenLabsApiKey || !agentId || !agentPhoneNumberId) {
    return NextResponse.json({ error: 'Server configuration missing.' }, { status: 500 });
  }

  const apiEndpoint = 'https://api.elevenlabs.io/v1/convai/conversation/create_phone_call';

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        // The number you added (+355...) is used as the caller ID
        agent_phone_number_id: agentPhoneNumberId,
        // The random number you want the agent to call
        to_number: recipientPhoneNumber, 
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs API Error:', errorData);
      throw new Error(`API call failed: ${errorData.detail || response.statusText}`);
    }

    const data = await response.json();
    console.log('Call initiated successfully:', data);

    return NextResponse.json({ 
        message: 'Call initiated successfully', 
        call_id: data.call_id 
    });

  } catch (error: any) {
    console.error('Error initiating phone call:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate call' }, { status: 500 });
  }
}

