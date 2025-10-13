/**
 * Poster API Route
 *
 * This route is stubbed for future server-side rendering of quote posters
 * using @napi-rs/canvas or similar server-side canvas libraries.
 *
 * For MVP, poster composition is handled client-side with Canvas API
 * and download functionality in the poster-canvas component.
 */

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { quoteText, author, style, imageUrl, width, height } = await req.json();

    // Validate required parameters
    if (!quoteText) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'quoteText parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Implement server-side poster rendering
    // For now, return a message indicating client-side rendering
    return new Response(
      JSON.stringify({
        message: 'Server-side poster rendering not yet implemented. Use client-side canvas component.',
        clientSideOnly: true,
      }),
      {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Poster API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process poster request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
