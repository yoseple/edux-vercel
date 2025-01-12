import 'server-only';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/db_types';
import { auth } from '@/auth';
import { nanoid } from '@/lib/utils';

export const runtime = 'edge';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    // Pass the promise directly without awaiting cookies()
    const cookieStorePromise = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStorePromise,
    });

    // Parse incoming request
    const json = await req.json();
    const { messages, previewToken } = json;

    // Authenticate the user
    const cookieStore = await cookieStorePromise; // Resolve cookies
    const userId = (await auth({ cookieStore }))?.user.id;

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Update API key if previewToken is provided
    if (previewToken) {
      configuration.apiKey = previewToken;
    }

    // Create a chat completion request to OpenAI
    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: true,
    });

    // Stream the response back to the client
    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        try {
          const title = json.messages[0]?.content?.substring(0, 100) ?? 'Untitled';
          const id = json.id ?? nanoid();
          const createdAt = Date.now();
          const path = `/chat/${id}`;
          const payload = {
            id, // Ensure id is valid in the schema
            title,
            userId,
            createdAt,
            path,
            messages: [
              ...messages,
              {
                content: completion,
                role: 'assistant',
              },
            ],
          };

          // Insert chat into the database
          const { error } = await supabase.from('chats').upsert(payload);

          if (error) {
            console.error('Database upsert error:', error);
          }
        } catch (dbError) {
          console.error('Error during chat upsert:', dbError);
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in POST /api/chat:', error);

    // Handle and log unexpected errors
    return new Response('Internal Server Error', { status: 500 });
  }
}