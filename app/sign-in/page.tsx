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

export default async function SignInPage() {
  const cookieStore = cookies();
  const session = await auth({ cookieStore });

  // Redirect to home if the user is already logged in
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold mb-4">Welcome Back</h1>
        {/* Login form */}
        <LoginForm action="sign-in" />
        <Separator className="my-4" />
        {/* Login with alternative methods */}
        <div className="flex justify-center">
          <LoginButton />
        </div>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/sign-up" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}