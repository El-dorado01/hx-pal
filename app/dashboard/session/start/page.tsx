'use client';

import React from 'react';
import { BiodataForm } from '@/components/session/biodata-form';
import { HistoryForm } from '@/components/session/history-form';
import { PresentingComplaintForm } from '@/components/session/presenting-complaint-form';
import { PmhForm } from '@/components/session/pmh-form';
import { DrugHistoryForm } from '@/components/session/drug-history-form';
import { FamilyHistoryForm } from '@/components/session/family-history-form';
import { SocialHistoryForm } from '@/components/session/social-history-form';
import { RosForm } from '@/components/session/ros-form';
import { HxPalPanel } from '@/components/session/hx-pal-panel';
import { Button } from '@/components/ui/button';
import { SummaryView } from '@/components/session/summary-view';
import { SessionProvider, useSession } from '@/lib/SessionContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const STAGE_CONFIG = {
  BIODATA: {
    number: 1,
    label: 'Patient Biodata',
    title: 'Patient Information',
    description:
      'Collect essential patient biodata to begin the clinical assessment.',
  },
  PRESENTING_COMPLAINT: {
    number: 2,
    label: 'Presenting Complaint',
    title: 'Chief Complaint',
    description:
      'Document the main complaint that brought the patient to seek medical attention.',
  },
  HISTORY: {
    number: 3,
    label: 'History Taking',
    title: 'History of Complaint',
    description: 'Explore the 5 Cs of the presenting complaint',
  },
  PMH: {
    number: 4,
    label: 'PMH',
    title: 'Past Medical History',
    description: 'Record past conditions and surgeries',
  },
  DRUG_HISTORY: {
    number: 5,
    label: 'DH',
    title: 'Drug History',
    description: 'Medications and Allergies',
  },
  ROS: {
    number: 6,
    label: 'ROS',
    title: 'Review of Systems',
    description: 'Systemic Screening',
  },
  FAMILY_HISTORY: {
    number: 7,
    label: 'FH',
    title: 'Family History',
    description: 'Hereditary Conditions',
  },
  SOCIAL_HISTORY: {
    number: 8,
    label: 'SH',
    title: 'Social History',
    description: 'Lifestyle & Support',
  },
  SUMMARY: {
    number: 9,
    label: 'Summary',
    title: 'Session Summary',
    description: 'Review and Complete',
  },
};

function SessionStartContent() {
  const {
    currentHint,
    hintHistory,
    currentStage,
    goToStage,
    isAnalyzing,
    isSaving,
    status,
    sessionId,
  } = useSession();

  // Redirect to review page if session is already completed
  React.useEffect(() => {
    if (status === 'COMPLETED' && sessionId) {
      window.location.href = `/dashboard/sessions/${sessionId}`;
    }
  }, [status, sessionId]);

  const stageConfig = STAGE_CONFIG[currentStage as keyof typeof STAGE_CONFIG];

  const orderedStages = Object.keys(STAGE_CONFIG).sort(
    (a, b) =>
      STAGE_CONFIG[a as keyof typeof STAGE_CONFIG].number -
      STAGE_CONFIG[b as keyof typeof STAGE_CONFIG].number,
  );

  if (!stageConfig) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center space-y-4'>
          <p className='text-muted-foreground'>
            Session stage mismatch detected. Resetting to summary...
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1 p-6 md:p-8'>
      <div className='max-w-4xl mx-auto w-full space-y-6'>
        {/* Header */}
        <div className='space-y-3 text-center'>
          <div className='flex items-center justify-center gap-4'>
            <div className='inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em]'>
              Stage {stageConfig.number}: {stageConfig.label}
            </div>
            {/* Auto-save indicator */}
            <div
              className={`flex items-center gap-1.5 transition-all duration-500 ${
                isSaving ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span className='text-[9px] font-bold uppercase tracking-widest text-muted-foreground'>
                {isSaving ? 'Saving...' : 'Saved'}
              </span>
            </div>
          </div>
          <h1 className='text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight'>
            {stageConfig.title.split(' ')[0]}{' '}
            <span className='text-primary inline-block relative'>
              {stageConfig.title.split(' ').slice(1).join(' ')}
              <div className='absolute -bottom-1 left-0 w-full h-0.5 bg-primary/20' />
            </span>
          </h1>
          <p className='text-muted-foreground text-sm max-w-xl mx-auto'>
            {stageConfig.description}
          </p>
        </div>

        {/* Progress Indicator */}
        <TooltipProvider>
          <div className='flex items-center gap-2 justify-center'>
            {orderedStages.map((stageKey, index) => {
              const config =
                STAGE_CONFIG[stageKey as keyof typeof STAGE_CONFIG];
              const isPast = config.number <= stageConfig.number;
              const isLocked = index > (useSession().maxStageIndex ?? 0) + 1;

              return (
                <Tooltip key={stageKey}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => !isLocked && goToStage(stageKey as any)}
                      disabled={isLocked}
                      className={`h-1.5 w-12 rounded-none transition-all duration-300 outline-none ${
                        isPast
                          ? 'bg-primary cursor-pointer hover:opacity-80'
                          : isLocked
                            ? 'bg-muted cursor-not-allowed opacity-30'
                            : 'bg-muted cursor-pointer hover:opacity-80'
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='font-bold uppercase tracking-widest text-[10px]'>
                      {isLocked ? 'Locked' : config.label}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* HX Pal Hint Panel */}
        <HxPalPanel
          currentHint={currentHint || undefined}
          hintHistory={hintHistory}
          isAnalyzing={isAnalyzing}
        />

        {/* Form - Conditional based on stage */}
        <div className='bg-card border-none p-0 md:p-0 rounded-none shadow-none'>
          {currentStage === 'BIODATA' && <BiodataForm />}
          {currentStage === 'PRESENTING_COMPLAINT' && (
            <PresentingComplaintForm />
          )}
          {currentStage === 'HISTORY' && <HistoryForm />}
          {currentStage === 'PMH' && <PmhForm />}
          {currentStage === 'DRUG_HISTORY' && <DrugHistoryForm />}
          {currentStage === 'ROS' && <RosForm />}
          {currentStage === 'FAMILY_HISTORY' && <FamilyHistoryForm />}
          {currentStage === 'SOCIAL_HISTORY' && <SocialHistoryForm />}
          {currentStage === 'SUMMARY' && <SummaryView />}
        </div>
      </div>
    </div>
  );
}

export default function SessionStartPage() {
  return (
    <SessionProvider>
      <SessionStartContent />
    </SessionProvider>
  );
}
