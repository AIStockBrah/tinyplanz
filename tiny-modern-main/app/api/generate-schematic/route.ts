import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // First, get a detailed description from ChatGPT-4
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert architectural designer. Create a detailed description of a schematic layout based on the provided architectural description. Include specific measurements, room placements, and technical details.'
          },
          {
            role: 'user',
            content: `Create a detailed schematic layout description for: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!descriptionResponse.ok) {
      throw new Error('Failed to generate schematic description');
    }

    const descriptionData = await descriptionResponse.json();
    const schematicDescription = descriptionData.choices[0].message.content;

    // Then, use DALL-E to generate the schematic image
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Create a professional architectural schematic layout based on this description: ${schematicDescription}. The image should be a technical drawing with measurements, room labels, and furniture placement. Use a clean, professional style with black lines on white background.`,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      }),
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to generate schematic image');
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    return NextResponse.json({ 
      imageUrl,
      description: schematicDescription 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 