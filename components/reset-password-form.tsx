'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { resetPasswordAction, resendOtpAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, Mail } from 'lucide-react';

const resetSchema = z
  .object({
    token: z.string().length(6, 'Reset code must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = (data: ResetFormData) => {
    if (!email) {
      toast.error('Missing email', {
        description: 'No email address found for password reset.',
      });
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({
        email,
        token: data.token,
        password: data.password,
      });

      if (result?.error) {
        toast.error('Reset failed', {
          description: result.error,
        });
      } else {
        toast.success('Password reset complete', {
          description: 'You can now log in with your new password.',
        });
        router.push('/login');
      }
    });
  };

  const onResend = async () => {
    if (countdown > 0 || !email) return;

    const result = await resendOtpAction(email);
    if (result.success) {
      toast.success('Code resent');
      setCountdown(60);
    } else {
      toast.error('Failed to resend', { description: result.error });
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Set new password</CardTitle>
          <CardDescription>
            We've sent a code to <span className='font-medium'>{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='token'>Reset Code</FieldLabel>
                <Input
                  id='token'
                  placeholder='000000'
                  maxLength={6}
                  className='text-center text-2xl tracking-[0.5em] font-bold'
                  disabled={isPending}
                  {...register('token')}
                />
                {errors.token && (
                  <FieldError>{errors.token.message}</FieldError>
                )}
              </Field>

              <Field>
                <div className='grid grid-cols-1 gap-4'>
                  <Field>
                    <FieldLabel htmlFor='password'>New Password</FieldLabel>
                    <div className='relative group'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        className='pl-10 pr-10'
                        disabled={isPending}
                        {...register('password')}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity'
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='password_confirmation'>
                      Confirm New Password
                    </FieldLabel>
                    <div className='relative group'>
                      <Input
                        id='password_confirmation'
                        type={showConfirmPassword ? 'text' : 'password'}
                        className='pr-10'
                        disabled={isPending}
                        {...register('password_confirmation')}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity'
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <FieldError>
                        {errors.password_confirmation.message}
                      </FieldError>
                    )}
                  </Field>
                </div>
              </Field>

              <Button
                type='submit'
                disabled={isPending}
                className='w-full'
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className='text-center text-sm'>
                Didn't receive a code?{' '}
                <button
                  type='button'
                  onClick={onResend}
                  disabled={countdown > 0}
                  className={cn(
                    'underline font-medium',
                    countdown > 0 &&
                      'text-muted-foreground underline-none opacity-50 cursor-not-allowed',
                  )}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
              </div>

              <div className='text-center text-sm'>
                <Link
                  href='/login'
                  className='underline'
                >
                  Back to login
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
