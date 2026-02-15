'use client';

import React, { useState, useEffect } from 'react';
import { HistoryProvider, useHistory } from '@/lib/HistoryContext';
import { STAGE_LABELS, STAGE_ORDER, HistoryStage } from '@/lib/types';
import BiodataStage from './stages/BiodataStage';
import ChiefComplaintStage from './stages/ChiefComplaintStage';
import HPIStage from './stages/HPIStage';
import ROSStage from './stages/ROSStage';
import PMHStage from './stages/PMHStage';
import DrugHistoryStage from './stages/DrugHistoryStage';
import FamilyHistoryStage from './stages/FamilyHistoryStage';
import SocialHistoryStage from './stages/SocialHistoryStage';
import SummaryStage from './stages/SummaryStage';
import { getRealTimeHint } from '@/lib/ai-actions';

export default function HistorySessionContainer() {
  return (
    <HistoryProvider>
      <HistorySessionContent />
    </HistoryProvider>
  );
}

function HistorySessionContent() {
  const { session, setMode, nextStage, prevStage } = useHistory();
  const [hint, setHint] = useState<string>(
    "Welcome! Let's start with the patient's biodata.",
  );
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    async function fetchHint() {
      setLoadingHint(true);
      const newHint = await getRealTimeHint(session);
      setHint(newHint || 'Continue with the current stage.');
      setLoadingHint(false);
    }
    fetchHint();
  }, [session.currentStage, session.data.chiefComplaints.length]); // Refresh on stage change or key data updates

  const renderStage = (stage: HistoryStage) => {
    switch (stage) {
      case 'BIODATA':
        return <BiodataStage />;
      case 'CHIEF_COMPLAINT':
        return <ChiefComplaintStage />;
      case 'HPI':
        return <HPIStage />;
      case 'PMH':
        return <PMHStage />;
      case 'DRUG_HISTORY':
        return <DrugHistoryStage />;
      case 'FAMILY_HISTORY':
        return <FamilyHistoryStage />;
      case 'SOCIAL_HISTORY':
        return <SocialHistoryStage />;
      case 'ROS':
        return <ROSStage />;
      case 'SUMMARY':
        return <SummaryStage />;
      default:
        return (
          <div className='min-h-[300px] bg-black/2 border border-dashed border-black/10 rounded-xl flex flex-col items-center justify-center text-black/20 gap-4'>
            <span className='text-4xl text-black/10'>Coming Soon</span>
            <p className='text-sm italic'>
              The {STAGE_LABELS[stage]} stage is being prepared.
            </p>
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto'>
      {/* Header */}
      <header className='flex justify-between items-center bg-white/40 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary p-2 rounded-xl text-white'>🩺</div>
          <h1 className='text-xl font-bold'>hx-pal Session</h1>
        </div>

        <div className='flex bg-white/50 p-1 rounded-full border border-black/5'>
          <button
            onClick={() => setMode('HINT')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${session.mode === 'HINT' ? 'bg-primary text-white shadow-sm' : 'hover:bg-black/5'}`}
          >
            Hint Mode
          </button>
          <button
            onClick={() => setMode('FULLY_ASSISTED')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${session.mode === 'FULLY_ASSISTED' ? 'bg-primary text-white shadow-sm' : 'hover:bg-black/5'}`}
          >
            Fully Assisted
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className='flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]'>
        {/* Left Side: Stages & Input (Workspace) */}
        <div className='lg:col-span-8 flex flex-col gap-4 overflow-hidden'>
          <div className='flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide'>
            {STAGE_ORDER.map((stage) => (
              <div
                key={stage}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${session.currentStage === stage ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-black/5 text-black/40'}`}
              >
                {STAGE_LABELS[stage]}
              </div>
            ))}
          </div>

          <div className='card-glass flex-1 overflow-y-auto'>
            <h2 className='text-2xl font-semibold mb-6'>
              {STAGE_LABELS[session.currentStage]}
            </h2>

            {/* Dynamic Content */}
            <div className='flex-1 overflow-y-auto'>
              {renderStage(session.currentStage)}
            </div>

            <div className='mt-8 flex justify-between items-center bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-sm'>
              <button
                onClick={prevStage}
                disabled={session.currentStage === STAGE_ORDER[0]}
                className='btn-secondary disabled:opacity-30'
              >
                Previous
              </button>
              <button
                onClick={nextStage}
                disabled={
                  session.currentStage === STAGE_ORDER[STAGE_ORDER.length - 1]
                }
                className='btn-primary disabled:opacity-30'
              >
                Next Step
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Assistant Panel */}
        <aside className='lg:col-span-4 flex flex-col h-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-xl'>
          <div className='p-6 border-b border-black/5 flex items-center gap-2'>
            <span className='animate-pulse w-2 h-2 bg-green-500 rounded-full'></span>
            <h3 className='font-semibold text-black/70'>
              {session.mode === 'HINT' ? 'The Hint-Pal' : 'The Assistant-Pal'}
            </h3>
          </div>

          <div className='flex-1 p-6 overflow-y-auto'>
            <div
              className={`bg-primary/5 border border-primary/10 p-5 rounded-2xl relative transition-all ${loadingHint ? 'opacity-50 grayscale' : 'opacity-100'}`}
            >
              <p className='text-sm leading-relaxed text-black/80 italic'>
                {hint}
              </p>
              <div className='absolute top-0 right-4 translate-y-[-50%] bg-primary text-[10px] text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider'>
                {session.mode === 'HINT' ? 'Advice' : 'Prompt'}
              </div>
            </div>
          </div>

          <div className='p-4 bg-black/5 text-center'>
            <span className='text-[10px] text-black/40 uppercase font-bold tracking-widest'>
              Powered by hx-pal Logic
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}
