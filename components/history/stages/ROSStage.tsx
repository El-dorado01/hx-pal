'use client';

import React from 'react';
import { useHistory } from '@/lib/HistoryContext';
import { MEDICAL_SYSTEMS, MedicalSystem } from '@/lib/types';

export default function ROSStage() {
  const { session, updateROS } = useHistory();
  const { chiefComplaints, ros } = session.data;

  // Smart Filtering: Find systems already covered in Chief Complaints/HPI
  const coveredSystems = new Set(
    chiefComplaints
      .map((cc) => cc.system)
      .filter((system): system is MedicalSystem => !!system),
  );

  const systemsToReview = MEDICAL_SYSTEMS.filter(
    (system) => !coveredSystems.has(system),
  );

  if (systemsToReview.length === 0) {
    return (
      <div className='text-center py-12 card-glass text-black/40 space-y-4'>
        <p className='font-semibold text-primary'>Systems fully covered!</p>
        <p className='text-sm'>
          Since all systems were addressed in the Chief Complaints and HPI, the
          Review of Systems is complete.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-primary/5 p-4 rounded-xl border border-primary/10 mb-6'>
        <p className='text-xs text-primary/70 font-medium'>
          💡 Smart Filter Active: Systems already addressed (
          {Array.from(coveredSystems).join(', ')}) are hidden to avoid
          repetition.
        </p>
      </div>

      <div className='space-y-6'>
        {systemsToReview.map((system) => (
          <section
            key={system}
            className='space-y-3 p-5 card-glass border-black/5'
          >
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-black/70 flex items-center gap-2'>
                <span className='w-2 h-6 bg-primary/20 rounded-full'></span>
                {system} System
              </h3>
            </div>

            <textarea
              placeholder={`Any other respiratory or constitutional symptoms in the ${system} system? (e.g. night sweats, weight loss, etc.)`}
              value={ros[system] || ''}
              onChange={(e) => updateROS(system, e.target.value)}
              className='w-full h-32 bg-white/50 border border-black/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all'
            />
          </section>
        ))}
      </div>
    </div>
  );
}
