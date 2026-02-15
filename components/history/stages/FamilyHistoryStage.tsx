'use client';

import React from 'react';
import { useHistory } from '@/lib/HistoryContext';

export default function FamilyHistoryStage() {
  const { session, updateFamilyHistory } = useHistory();
  const { familyHistory } = session.data;

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2'>
        <p className='text-xs text-primary/70 font-medium italic'>
          💡 Prompt: Look for hereditary conditions or infectious contacts (TB,
          etc.) in first-degree relatives.
        </p>
      </div>

      <textarea
        placeholder='Enter family medical history...'
        value={familyHistory || ''}
        onChange={(e) => updateFamilyHistory(e.target.value)}
        className='w-full h-64 bg-white/50 border border-black/10 rounded-2xl p-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all'
      />
    </div>
  );
}
