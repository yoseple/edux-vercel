'use server'
import 'server-only'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return [];
  }
  try {
    const cookieStore = await cookies();
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore,
    });

    const { data, error } = await supabase
      .from('chats')
      .select('id, title, createdAt, path, messages') // Select specific columns
      .eq('userId', userId) // Match chats for the given user
      .order('createdAt', { ascending: false }); // Sort by creation date

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2));
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Error fetching chats:', JSON.stringify(error, null, 2));
    return [];
  }
}



export async function getChat(id: string, userId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .eq('userId', userId) // Ensure the chat belongs to the logged-in user
    .single();

  if (error) {
    console.error('Error fetching chat:', error.message);
    return null;
  }

  return data;
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    await supabase.from('chats').delete().eq('id', id).throwOnError()

    revalidatePath('/')
    return revalidatePath(path)
  } catch (error) {
    return {
      error: 'Unauthorized'
    }
  }
}

export async function clearChats() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    await supabase.from('chats').delete().throwOnError()
    revalidatePath('/')
    return redirect('/')
  } catch (error) {
    console.log('clear chats error', error)
    return {
      error: 'Unauthorized'
    }
  }
}

export async function getSharedChat(id: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .not('payload->sharePath', 'is', null)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function shareChat(chat: Chat) {
  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  await supabase
    .from('chats')
    .update({ payload: payload as any })
    .eq('id', chat.id)
    .throwOnError()

  return payload
}
