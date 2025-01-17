import { type Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { getChat } from '@/app/actions';
import { Chat } from '@/components/chat';
import { cookies } from 'next/headers';

export const runtime = 'edge';
export const preferredRegion = 'home';

export interface ChatPageProps {
  params: {
    id: string;
  };
}

// Dynamic metadata for the chat page
export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {

  const {id} =  params;
  const cookieStore = cookies();
  const session = await auth({ cookieStore });

  if (!session?.user) {
    return {};
  }

  const chat = await getChat(id, session.user.id); // Pass userId here
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat',
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const {id} = params
  const cookieStore = cookies();
  const session = await auth({ cookieStore });

  // Redirect to sign-in page if not authenticated
  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${id}`);
  }

  // Fetch the chat data for the logged-in user
  const chat = await getChat(id, session.user.id);

  // Show 404 page if the chat is not found or doesn't belong to the user
  if (!chat) {
    notFound();
  }

  return <Chat id={chat.id} initialMessages={chat.messages} />;
}
