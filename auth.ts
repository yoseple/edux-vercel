import 'server-only'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const auth = async ({
  cookieStore
}: {
  cookieStore: Promise<ReturnType<typeof cookies>> | ReturnType<typeof cookies>
}) => {
  // Wait for cookieStore if it's a promise
  const resolvedCookieStore = await cookieStore
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerComponentClient({
    cookies: () => resolvedCookieStore
  })
  
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}