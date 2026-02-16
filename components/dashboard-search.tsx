'use client';

import React from 'react';
import Image from 'next/image';
import {
  Paperclip,
  Lightbulb,
  ChevronDown,
  AudioLines,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


export function DashboardSearch() {
  return (
    <div className='flex flex-col items-center justify-center w-full max-w-4xl px-4 py-20 mx-auto space-y-12'>
      {/* Logo Section */}
      <div className='flex items-center'>
        <div className='relative w-20 h-20 overflow-hidden'>
          <Image
            src='/logo.png'
            alt='Hx Pal Logo'
            fill
            className='object-contain'
            priority
          />
        </div>

        <h1 className='text-4xl font-bold tracking-tight text-foreground'>
          Hx Pal
        </h1>
      </div>

      {/* Search Bar Container */}
      <div className='relative w-full space-y-6'>
        <Alert
          variant='default'
          className='rounded-none bg-primary/5 border-primary/20'
        >
          <AlertCircle className='h-4 w-4 text-primary' />
          <AlertTitle className='text-primary font-bold'>
            Coming Soon
          </AlertTitle>
          <AlertDescription className='text-muted-foreground'>
            We're working hard to bring you the full Hx Pal search experience.
            This feature will be available in the next update.
          </AlertDescription>
        </Alert>

        <div className='flex items-center w-full px-4 py-2 bg-muted/50 border border-border rounded-none shadow-sm cursor-not-allowed group opacity-70'>
          {/* Left Icon: Attachment */}
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 text-muted-foreground hover:text-foreground rounded-none'
          >
            <Paperclip className='size-5' />
          </Button>

          {/* Main Input */}
          <input
            type='text'
            placeholder='How can I help you today?'
            className='flex-1 bg-transparent border-none outline-none px-4 py-2 text-lg text-foreground placeholder:text-muted-foreground cursor-not-allowed'
            disabled
          />

          {/* Right Section: Insights, Expert, Audio */}
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              variant='ghost'
              size='icon'
              className='hidden sm:flex text-muted-foreground hover:text-foreground rounded-none'
            >
              <Lightbulb className='size-5' />
            </Button>

            <Button
              variant='ghost'
              className='hidden sm:flex items-center gap-1 px-3 h-9 rounded-none text-foreground font-medium hover:bg-muted'
            >
              Expert
              <ChevronDown className='size-4' />
            </Button>

            <Button
              size='icon'
              className='bg-foreground text-background hover:bg-foreground/90 rounded-none size-10 shrink-0'
            >
              <AudioLines className='size-5' />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions / Helpers */}
      <div className='flex flex-wrap items-center justify-center gap-3 mt-8'>
        {[
          'Analyze Records',
          'Recent Sessions',
          'Clinical Summary',
          'Expert Consult',
        ].map((action) => (
          <Button
            key={action}
            variant='outline'
            className='rounded-none px-5 border-border hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all'
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
