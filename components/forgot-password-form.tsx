'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Loader2, LogIn, Users2, Mail } from 'lucide-react';
import { forgotPasswordAction } from '@/app/actions/auth';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data: ForgotFormData) => {
    startTransition(async () => {
      const result = await forgotPasswordAction(data);
      if (result?.error) {
        toast.error('Error', { description: result.error });
      } else {
        toast.success('Check your email', {
          description: 'A reset code has been sent if the account exists.',
        });
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }
    });
  };

  return (
    <div
      className={cn('flex flex-col gap-6 mt-4', className)}
      {...props}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>

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
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <Button
              type='submit'
              disabled={isPending}
              className='w-full'
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending code...
                </>
              ) : (
                'Send Code'
              )}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <Button
              variant='outline'
              asChild
              type='button'
              className='w-full'
            >
              <Link href='/login'>
                <LogIn className='size-4 mr-2' />
                Sign in instead
              </Link>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
