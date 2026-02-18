'use client';

import React from 'react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Bot } from '@/components/animate-ui/icons/bot';
import { ChevronRight, Loader2 } from 'lucide-react';
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
  isAnalyzing?: boolean;
}

export function HxPalPanel({
  currentHint,
  hintHistory = [],
  isAnalyzing = false,
}: HxPalPanelProps) {
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  if (!currentHint && !isAnalyzing) return null;

  const openHistoryAndScroll = (hintId?: string) => {
    setIsHistoryOpen(true);
    if (hintId) {
      setTimeout(() => {
        const element = document.getElementById(`hint-${hintId}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          element.classList.add('bg-primary/10');
          setTimeout(() => {
            element.classList.remove('bg-primary/10');
          }, 2000);
        }
      }, 300); // Slightly longer delay for sheet animation
    }
  };

  return (
    <div
      id='hx-pal-hint-panel'
      className='w-full mb-6 scroll-mt-20'
    >
      {/* Hint Panel */}
      <div
        className={`relative bg-primary/5 border-2 border-primary/20 rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(var(--primary),0.1)] transition-all duration-500`}
      >
        {/* View History Button - Absolute positioned for space optimization */}
        <div className='absolute top-2 right-2 z-10'>
          <Sheet
            open={isHistoryOpen}
            onOpenChange={setIsHistoryOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='rounded-none hover:bg-primary/20 h-auto py-1 px-2'
              >
                <span className='text-[10px] sm:text-xs uppercase tracking-wider font-bold'>
                  History
                </span>
                <ChevronRight
                  size={14}
                  className='ml-0.5'
                />
              </Button>
            </SheetTrigger>
            <SheetContent className='rounded-none border-l-2 border-primary/20 w-[400px] sm:w-[540px] flex flex-col'>
              <SheetHeader className='shrink-0'>
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
              <div className='mt-6 space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-primary/20'>
                {hintHistory.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground text-sm'>
                    No hint history yet
                  </div>
                ) : (
                  hintHistory
                    .slice()
                    .reverse()
                    .map((hint) => (
                      <div
                        key={hint.id}
                        id={`hint-${hint.id}`}
                        className='relative border-l-2 border-primary/20 pl-4 pb-6 transition-colors hover:bg-primary/5 group'
                      >
                        {/* Timeline Dot */}
                        <div className='absolute -left-[5px] top-0 size-2 bg-primary rounded-none group-hover:scale-125 transition-transform' />

                        {/* Hint Content */}
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest'>
                            {hint.stage && (
                              <>
                                <span className='text-primary/70'>
                                  {hint.stage}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {new Date(hint.timestamp).toLocaleTimeString([], {
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

        <div className='flex items-start gap-4'>
          {/* Animated Bot Icon */}
          <div className='shrink-0 p-2 bg-primary/10 border-2 border-primary/20 hidden sm:block'>
            <AnimateIcon
              animateOnView
              loop
              loopDelay={3000}
            >
              <Bot
                size={28}
                className='text-primary'
              />
            </AnimateIcon>
          </div>

          {/* Hint Content */}
          <div className='flex-1 space-y-2 min-w-0 pr-16 sm:pr-0'>
            <div className='flex items-center gap-2'>
              <h3 className='text-xs font-black uppercase tracking-[0.2em] text-primary/60'>
                HX Pal Hint
              </h3>
              <div className='h-[3px] w-20 bg-primary/20' />
            </div>

            <div className='relative group'>
              {isAnalyzing ? (
                <div className='py-6 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-500'>
                  <div className='relative mb-4'>
                    <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse' />
                    <Loader2 className='w-10 h-10 text-primary animate-spin relative z-10' />
                  </div>
                  <p className='text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse'>
                    Analyzing Clinical Data...
                  </p>
                </div>
              ) : (
                <>
                  <div className='max-h-32 overflow-hidden transition-all duration-300 relative'>
                    <div className='text-sm leading-relaxed text-foreground markdown-prose break-words font-medium'>
                      {currentHint?.message && (
                        <ReactMarkdown>{currentHint.message}</ReactMarkdown>
                      )}
                    </div>
                    {/* Gradient Fade for long text */}
                    <div className='absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background/10 to-transparent pointer-events-none' />
                  </div>

                  {/* View Full Insight Button */}
                  <div className='pt-2'>
                    <Button
                      variant='link'
                      size='sm'
                      className='p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 group'
                      onClick={() => openHistoryAndScroll(currentHint?.id)}
                    >
                      View Full Insight
                      <ChevronRight className='w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform' />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
