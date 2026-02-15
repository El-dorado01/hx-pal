'use client';

import React from 'react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Bot } from '@/components/animate-ui/icons/bot';
import { ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Hint {
  id: string;
  message: string;
  timestamp: Date;
  stage?: string;
}

interface HxPalPanelProps {
  currentHint?: Hint;
  hintHistory?: Hint[];
}

export function HxPalPanel({ currentHint, hintHistory = [] }: HxPalPanelProps) {
  if (!currentHint) return null;

  return (
    <div className='w-full mb-6'>
      {/* Hint Panel */}
      <div className='bg-primary/5 border-2 border-primary/20 rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(var(--primary),0.1)]'>
        <div className='flex items-start gap-4'>
          {/* Animated Bot Icon */}
          <div className='shrink-0'>
            <AnimateIcon
              animateOnView
              loop
              loopDelay={3000}
            >
              <Bot
                size={32}
                className='text-primary'
              />
            </AnimateIcon>
          </div>

          {/* Hint Content */}
          <div className='flex-1 space-y-2'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold uppercase tracking-wider text-primary'>
                HX Pal Hint
              </h3>
              <div className='h-1 w-8 bg-primary/20' />
            </div>
            <div className='text-sm leading-relaxed text-foreground markdown-prose'>
              <ReactMarkdown>{currentHint.message}</ReactMarkdown>
            </div>
          </div>

          {/* View History Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='rounded-none shrink-0 hover:bg-primary/10'
              >
                <span className='text-xs uppercase tracking-wider font-semibold'>
                  History
                </span>
                <ChevronRight
                  size={16}
                  className='ml-1'
                />
              </Button>
            </SheetTrigger>
            <SheetContent className='rounded-none border-l-2 border-primary/20 w-[400px] sm:w-[540px]'>
              <SheetHeader>
                <SheetTitle className='flex items-center gap-2 text-lg font-black uppercase tracking-tight'>
                  <AnimateIcon
                    animateOnView
                    loop
                    loopDelay={3000}
                  >
                    <Bot
                      size={24}
                      className='text-primary'
                    />
                  </AnimateIcon>
                  HX Pal History
                </SheetTitle>
              </SheetHeader>

              {/* Hint History Timeline */}
              <div className='mt-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2'>
                {hintHistory.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground text-sm'>
                    No hint history yet
                  </div>
                ) : (
                  hintHistory.map((hint, index) => (
                    <div
                      key={hint.id}
                      className='relative border-l-2 border-primary/20 pl-4 pb-4'
                    >
                      {/* Timeline Dot */}
                      <div className='absolute -left-[5px] top-0 size-2 bg-primary rounded-none' />

                      {/* Hint Content */}
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          {hint.stage && (
                            <>
                              <span className='font-semibold uppercase tracking-wider'>
                                {hint.stage}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span>
                            {hint.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className='text-sm leading-relaxed markdown-prose'>
                          <ReactMarkdown>{hint.message}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
