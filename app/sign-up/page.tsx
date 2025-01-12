import { auth } from '@/auth';
import { LoginButton } from '@/components/login-button';
import { LoginForm } from '@/components/login-form';
import { Separator } from '@/components/ui/separator';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Fix for metadata warning
export const metadata = {
  viewport: {
    themeColor: '#FFFFFF' // Replace with your desired theme color
  }
};

export default async function SignUpPage() {
  const cookieStore = cookies();
  const session = await auth({ cookieStore });

  // Redirect to home if user is already logged in
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold mb-4">Sign Up</h1>
        <LoginForm action="sign-up" />
        <Separator className="my-4" />
        <div className="flex justify-center">
          <LoginButton />
        </div>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/sign-in" className="text-blue-500">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}