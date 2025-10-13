import { generateText } from 'ai';
import { google } from '@/echo';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json(
        {
          error: 'Bad Request',
          message: 'Prompt parameter is required',
        },
        { status: 400 }
      );
    }

    // Use Google Gemini 2.5 Flash Image (Nano Banana) for image generation
    const result = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt: `Create an elegant, minimalist background image suitable for a quote poster. ${prompt}. The image should be abstract or scenic, with plenty of space for overlaying text. Avoid any text, words, or distracting elements. Style: professional, clean, aesthetic, high quality.`,
    });

    // Extract the first image from result.files
    if (!result.files || result.files.length === 0) {
      throw new Error('No image generated');
    }

    const imageFile = result.files.find(file => file.mediaType.startsWith('image/'));

    if (!imageFile) {
      throw new Error('No image file in response');
    }

    // Convert Uint8Array to base64
    const base64 = Buffer.from(imageFile.uint8Array).toString('base64');

    // Return as base64 data URL for easy display
    return Response.json({
      imageUrl: `data:${imageFile.mediaType};base64,${base64}`,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json(
      {
        error: 'Failed to generate image',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
