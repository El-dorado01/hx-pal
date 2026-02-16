'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  registerAction,
  verifyOtpAction,
  resendOtpAction,
} from '@/app/actions/auth';
import { toast } from 'sonner';
import {
  Loader2,
  Mail,
  Lock,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSignup = (data: SignupFormData) => {
    startTransition(async () => {
      const result = await registerAction(data);

      if (result?.error) {
        toast.error('Registration failed', {
          description: result.error,
        });
      } else {
        toast.success('Check your email', {
          description: 'A 6-digit verification code has been sent.',
        });
        setUserEmail(data.email);
        setStep('verify');
        setCountdown(60);
      }
    });
  };

  const onVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Invalid code', {
        description: 'Please enter a 6-digit code.',
      });
      return;
    }

    startTransition(async () => {
      const result = await verifyOtpAction({ email: userEmail, token: otp });

      if (result?.error) {
        toast.error('Verification failed', {
          description: result.error,
        });
      } else {
        toast.success('Verified!', {
          description: 'Your account is ready.',
        });
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  const onResend = async () => {
    if (countdown > 0) return;

    const result = await resendOtpAction(userEmail);
    if (result.success) {
      toast.success('Code resent');
      setCountdown(60);
    } else {
      toast.error('Failed to resend', { description: result.error });
    }
  };

  if (step === 'verify') {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Verify your email</CardTitle>
            <CardDescription>
              We've sent a code to{' '}
              <span className='font-medium'>{userEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4'>
              <Field>
                <FieldLabel htmlFor='otp'>Verification Code</FieldLabel>
                <Input
                  id='otp'
                  placeholder='000000'
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className='text-center text-2xl tracking-[0.5em] font-bold'
                  disabled={isPending}
                />
              </Field>
              <Button
                onClick={onVerify}
                disabled={isPending || otp.length !== 6}
                className='w-full'
              >
                {isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  'Verify Code'
                )}
              </Button>
              <div className='text-center text-sm'>
                Didn't receive a code?{' '}
                <button
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSignup)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='name'>Full Name</FieldLabel>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='name'
                    placeholder='John Doe'
                    className='pl-10'
                    disabled={isPending}
                    {...register('name')}
                  />
                </div>
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='m@example.com'
                    className='pl-10'
                    disabled={isPending}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <div className='grid grid-cols-2 gap-4'>
                  <Field>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
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
                      Confirm
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
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating
                    account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              <div className='text-center text-sm'>
                Already have an account?{' '}
                <Link
                  href='/login'
                  className='underline'
                >
                  Sign in
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <p className='px-6 text-center text-sm text-muted-foreground'>
        By clicking continue, you agree to our{' '}
        <Link
          href='#'
          className='underline'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href='#'
          className='underline'
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
