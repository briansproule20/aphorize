import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { openai, anthropic } from '@/echo';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface QuoteRequest {
  messages: UIMessage[];
  model: string;
  provider?: 'openai' | 'anthropic';
  mode?: 'search' | 'generate';
  query?: string;
  tags?: string[];
  author?: string;
  allowAiQuote?: boolean;
  occasion?: string;
  tone?: string;
  length?: string;
  audience?: string;
}

export async function POST(req: Request) {
  try {
    const {
      model,
      provider = 'anthropic',
      messages,
      mode = 'generate',
      query,
      tags,
      author,
      allowAiQuote = true,
      occasion,
      tone,
      length,
      audience,
    }: QuoteRequest = await req.json();

    // Validate required parameters
    if (!model) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Messages parameter is required and must be an array',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // If mode is search, try to find real quotes first
    if (mode === 'search' && query) {
      try {
        const quotesApiUrl =
          process.env.QUOTES_API_URL || 'https://api.quotable.io/search/quotes';

        const params = new URLSearchParams();
        params.append('query', query);
        if (author) params.append('author', author);
        if (tags && tags.length > 0) params.append('tags', tags.join(','));
        params.append('limit', '5');

        const response = await fetch(`${quotesApiUrl}?${params.toString()}`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          // Format the quotes as a response
          const quotesText = data.results
            .map(
              (q: any) =>
                `"${q.content}"\n— ${q.author}${q.tags?.length ? `\nTags: ${q.tags.join(', ')}` : ''}`
            )
            .join('\n\n');

          const responseMessage = {
            role: 'assistant' as const,
            content: [
              {
                type: 'text' as const,
                text: `Found ${data.count} real quote(s):\n\n${quotesText}`,
              },
            ],
          };

          // Return as a simple stream response
          const modelProvider = provider === 'openai' ? openai(model) : anthropic(model);
          const result = streamText({
            model: modelProvider,
            messages: convertToModelMessages([
              ...messages,
              {
                role: 'assistant',
                content: [
                  {
                    type: 'text',
                    text: `Found ${data.count} real quote(s):\n\n${quotesText}`,
                  },
                ],
              },
            ]),
            system: 'You are presenting real quotes found from a database. Display them exactly as provided.',
          });

          return result.toUIMessageStreamResponse({
            sendSources: true,
            sendReasoning: false,
          });
        }

        // No results found
        if (!allowAiQuote) {
          const modelProvider = provider === 'openai' ? openai(model) : anthropic(model);
          const result = streamText({
            model: modelProvider,
            messages: convertToModelMessages([
              ...messages,
              {
                role: 'assistant',
                content: [
                  {
                    type: 'text',
                    text: 'No exact quote found. Enable AI quote generation to craft an original line for this occasion.',
                  },
                ],
              },
            ]),
          });

          return result.toUIMessageStreamResponse({
            sendSources: true,
            sendReasoning: false,
          });
        }
        // Fall through to generate mode if allowAiQuote is true
      } catch (error) {
        console.error('Quote search error:', error);
        // Fall through to generate mode on error
      }
    }

    // Generate mode or search fallback
    let systemPrompt = `You are a helpful assistant that creates or finds memorable quotes.

If the user is asking for a REAL quote:
- Only return authentic, sourced quotes from real people
- Always include the author's name
- Never misattribute or fabricate quotes

If the user wants an AI-GENERATED quote:
- Create fresh, pithy 1-2 sentence lines that fit the occasion and tone
- Make it memorable and impactful
- Do NOT attribute it to real people
- Label it clearly as "AI-Generated"
- Never misattribute

If unsure whether a quote exists, say so.`;

    if (mode === 'generate') {
      systemPrompt = `You are a creative quote generator. Generate original, memorable quotes based on the user's requirements.

Requirements:
${occasion ? `- Occasion: ${occasion}` : ''}
${tone ? `- Tone: ${tone}` : ''}
${length ? `- Length: ${length}` : ''}
${audience ? `- Audience: ${audience}` : ''}

Guidelines:
- Create fresh, pithy 1-2 sentence lines
- Make it memorable and impactful
- Do NOT attribute to real people
- Label clearly as "AI-Generated Quote"
- Keep it concise and quotable
- Match the requested tone and occasion`;
    }

    const modelProvider = provider === 'openai' ? openai(model) : anthropic(model);
    const result = streamText({
      model: modelProvider,
      messages: convertToModelMessages(messages),
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
