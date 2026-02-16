import { ResetPasswordForm } from '@/components/reset-password-form';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          href='/'
          className='flex items-center self-center font-medium'
        >
          <div className='flex size-10 items-center justify-center rounded-md overflow-hidden'>
            <Image
              src='/logo.png'
              alt='HX-Pal Logo'
              width={40}
              height={40}
              className='object-contain'
            />
          </div>
          <span className='text-2xl font-bold tracking-tight'>HX Pal</span>
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
