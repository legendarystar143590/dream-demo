import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Received POST request at /api/convertTextToSpeech/route');
  const { text, voiceId, model_id, voice_settings } = await request.json();

  console.log('Request Body:', { text, voiceId, model_id, voice_settings });

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ELEVEN_LABS_API_KEY}`,
      },
      body: JSON.stringify({ text, voiceId, model_id, voice_settings }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error: ${response.status} - ${errorBody}`);
      return NextResponse.json({ error: 'Failed to convert text to speech' }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(Buffer.from(audioBuffer), {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
