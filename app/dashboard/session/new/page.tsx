'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ModeSelectionCard } from '@/components/session/mode-selection-card';
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb';
import { Bot } from '@/components/animate-ui/icons/bot';
import { RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/SessionContext';

export default function NewSessionPage() {
  const router = useRouter();
  const { mode } = useSession();
  const [showResumeDialog, setShowResumeDialog] = React.useState(false);
  const [hasExistingData, setHasExistingData] = React.useState(false);
  const [isCheckingPreferences, setIsCheckingPreferences] =
    React.useState(true);

  // Check for existing data on mount
  React.useEffect(() => {
    const keys = [
      'hx-pal-biodata',
      'hx-pal-complaints',
      'hx-pal-hpc',
      'hx-pal-pmh',
      'hx-pal-dh',
      'hx-pal-fh',
      'hx-pal-sh',
      'hx-pal-ros',
    ];

    const exists = keys.some((key) => {
      const val = window.localStorage.getItem(key);
      if (!val || val === 'null' || val === 'undefined') return false;
      try {
        const parsed = JSON.parse(val);
        if (!parsed) return false;
        if (Array.isArray(parsed)) return parsed.length > 0;
        if (typeof parsed === 'object') return Object.keys(parsed).length > 0;
        return !!parsed;
      } catch {
        return !!val && val !== 'null' && val !== 'undefined';
      }
    });

    if (exists) {
      setHasExistingData(true);

      // If we have a preference set (not ASK), we skip to start
      // BUT if we have data, maybe we should still prompt to resume?
      // User says: "if there's no active session detected, move to /session/start"
      // This implies if there IS an active session, we might want to prompt or just resume.
      // Let's stick to the prompt if data exists, but skip mode selection.
      if (mode !== 'ASK') {
        setShowResumeDialog(true);
        setIsCheckingPreferences(false);
      } else {
        setShowResumeDialog(true);
        setIsCheckingPreferences(false);
      }
    } else {
      // No data exists. If we have a preference, skip selection entirely.
      if (mode !== 'ASK') {
        router.push(`/dashboard/session/start?mode=${mode}`);
      } else {
        setIsCheckingPreferences(false);
      }
    }
  }, [mode, router]);

  if (isCheckingPreferences) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
          <p className='text-sm font-bold uppercase tracking-tighter animate-pulse'>
            Checking Preferences...
          </p>
        </div>
      </div>
    );
  }

  const clearSessionData = () => {
    const keys = [
      'hx-pal-biodata',
      'hx-pal-complaints',
      'hx-pal-hpc',
      'hx-pal-pmh',
      'hx-pal-dh',
      'hx-pal-fh',
      'hx-pal-sh',
      'hx-pal-ros',
      'hx-pal-stage',
    ];
    keys.forEach((key) => window.localStorage.removeItem(key));
  };

  const handleSelectMode = (mode: string) => {
    // If no existing data was found or user didn't resume, we ensure a clean slate
    if (!hasExistingData) {
      clearSessionData();
    }
    router.push(`/dashboard/session/start?mode=${mode}`);
  };

  const handleStartFresh = () => {
    clearSessionData();
    setHasExistingData(false);
    setShowResumeDialog(false);
  };

  const handleResume = () => {
    // Determine last stage
    const lastStage = window.localStorage.getItem('hx-pal-stage');

    // If they were at summary or finished, we treat it as starting fresh (letting them pick a mode)
    // but the dialog wouldn't usually show for finished sessions unless they didn't clear storage.
    // If they click resume, they WANT to see their data.
    if (lastStage === 'SUMMARY') {
      setShowResumeDialog(false);
    } else {
      router.push('/dashboard/session/start');
    }
  };

  return (
    <div className='flex flex-col flex-1 max-w-4xl mx-auto p-6 md:p-12 space-y-10'>
      <div className='space-y-4 text-center md:text-left'>
        <div className='inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em]'>
          Session Configuration
        </div>
        <h1 className='text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight'>
          Select Your{' '}
          <span className='text-primary inline-block relative'>
            Assistance Mode
            <div className='absolute -bottom-1 left-0 w-full h-1 bg-primary/20' />
          </span>
        </h1>
        <p className='text-muted-foreground text-sm max-w-2xl'>
          Tailor your clinical experience. Choose between subtle guidance or a
          fully guided clerkship process.
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
        <ModeSelectionCard
          title='Hint Mode'
          description='Perfect for experienced students. Get subtle clinical hints and the next best questions while maintaining full control.'
          icon={Lightbulb}
          onClick={() => handleSelectMode('HINT')}
        />
        <ModeSelectionCard
          title='Fully Assisted'
          description='A comprehensive clinical guide that walks you through every stage with direct prompts and structured assistance.'
          icon={Bot}
          primary
          onClick={() => handleSelectMode('ASSISTED')}
        />
      </div>

      {/* Footer */}
      <div className='flex flex-col items-center gap-2 pt-8 border-t border-border/50 opacity-60'>
        <p className='text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground'>
          Driven by Clinical Intelligence
        </p>
      </div>

      {/* Resume Session Dialog */}
      <Dialog
        open={showResumeDialog}
        onOpenChange={setShowResumeDialog}
      >
        <DialogContent className='sm:max-w-md bg-white dark:bg-zinc-950 border-2 border-primary/20 rounded-none shadow-xl'>
          <DialogHeader>
            <DialogTitle className='uppercase tracking-tighter font-black text-2xl flex items-center gap-2'>
              <RotateCcw className='w-6 h-6 text-primary' />
              Active Session Found
            </DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground'>
              You have an ongoing clinical session. Would you like to continue
              where you left off or start a fresh session?
            </DialogDescription>
          </DialogHeader>
          <div className='bg-primary/5 p-4 border border-primary/10 text-xs italic text-muted-foreground mb-4'>
            Starting fresh will clear all existing data from your current
            session.
          </div>
          <DialogFooter className='flex flex-row! gap-3 sm:justify-between sm:space-x-0'>
            <Button
              variant='outline'
              className='flex-1 gap-2 border-2 rounded-none'
              onClick={handleStartFresh}
            >
              Start Fresh
            </Button>
            <Button
              className='flex-1 gap-2 rounded-none font-bold uppercase'
              onClick={handleResume}
            >
              <Play className='w-4 h-4' />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
