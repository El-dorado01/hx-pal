'use client';

import React from 'react';
import { useHistory } from '@/lib/HistoryContext';

export default function DrugHistoryStage() {
  const { session, updateDrugHistory } = useHistory();
  const { drugHistory } = session.data;

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2'>
        <p className='text-xs text-primary/70 font-medium italic'>
          💡 Prompt: Ask about current medications (prescribed/OTC/herbal) and
          specifically check for ALLERGIES.
        </p>
      </div>

      <textarea
        placeholder='Enter medications and specific drug/food allergies...'
        value={drugHistory || ''}
        onChange={(e) => updateDrugHistory(e.target.value)}
        className='w-full h-64 bg-white/50 border border-black/10 rounded-2xl p-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all'
      />
    </div>
  );
}
