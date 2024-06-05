import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voiceId, model_id, voice_settings } = req.body;

  console.log('Request Body:', req.body);

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
      return res.status(response.status).json({ error: 'Failed to convert text to speech' });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}