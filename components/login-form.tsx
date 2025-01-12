'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Button } from '@/components/ui/button';
import { IconSpinner } from '@/components/ui/icons';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
  action: 'sign-in' | 'sign-up';
}

export function LoginForm({
  className,
  action = 'sign-in',
  ...props
}: LoginFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [formState, setFormState] = React.useState<{
    email: string;
    password: string;
    confirmPassword?: string; // Optional for sign-in
    major?: string; // Optional for sign-in
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    major: '' // Default empty major
  });

  const validateEduEmail = (email: string) => {
    if (!email.endsWith('.edu')) {
      throw new Error('Email must end with .edu.');
    }
  };

  const signIn = async () => {
    const { email, password } = formState;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return error;
  };

  const signUp = async () => {
    const { email, password, confirmPassword, major } = formState;

    // Validate .edu email
    validateEduEmail(email);

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    if (!major?.trim()) {
      throw new Error('Major is required for sign-up.');
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` }
    });

    if (!error && !data.session) {
      toast.success('Check your inbox to confirm your email address!');
    }

    return error;
  };

  const handleOnSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const error = action === 'sign-in' ? await signIn() : await signUp();
      if (error) {
        throw error;
      }
      toast.success(action === 'sign-in' ? 'Welcome back!' : 'Sign-up successful!');
      router.refresh();
    } catch (error: any) {
      if (error.message.includes('Email must end with .edu')) {
        toast.error('Only .edu emails are allowed.');
      } else if (error.message.includes('Passwords do not match')) {
        toast.error('Please ensure both passwords match.');
      } else if (error.message.includes('Major is required')) {
        toast.error('Please enter your major.');
      } else {
        toast.error(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div {...props}>
      <form onSubmit={handleOnSubmit}>
        <fieldset className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  email: e.target.value
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formState.password}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  password: e.target.value
                }))
              }
            />
          </div>
          {action === 'sign-up' && (
            <>
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  name="major"
                  type="text"
                  placeholder="Enter your major"
                  value={formState.major}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      major: e.target.value
                    }))
                  }
                />
              </div>
            </>
          )}
        </fieldset>

        <div className="mt-4 flex items-center">
          <Button disabled={isLoading}>
            {isLoading && <IconSpinner className="mr-2 animate-spin" />}
            {action === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </Button>
          <p className="ml-4">
            {action === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="font-medium">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href="/sign-in" className="font-medium">
                  Sign In
                </Link>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}