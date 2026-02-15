'use client';

import React, { useEffect, useState } from 'react';
import { useHistory } from '@/lib/HistoryContext';
import {
  generateClinicalSummary,
  generateDifferentials,
} from '@/lib/ai-actions';

export default function SummaryStage() {
  const { session } = useHistory();
  const [summary, setSummary] = useState<string | null>(null);
  const [differentials, setDifferentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [sum, diffs] = await Promise.all([
          generateClinicalSummary(session),
          generateDifferentials(session),
        ]);
        setSummary(sum || 'No summary available.');
        setDifferentials(diffs);
      } catch (error) {
        console.error('AI Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 space-y-6 animate-pulse'>
        <div className='w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin'></div>
        <div className='text-center'>
          <p className='text-lg font-bold text-black/60 italic'>
            "The Pal" is analyzing your findings...
          </p>
          <p className='text-sm text-black/30'>
            Synthesizing NASTROMA, 5 Cs, and ROS data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Clinical Summary Section */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-bold text-black/70 flex items-center gap-2'>
            <span className='bg-primary/10 p-2 rounded-lg text-primary text-sm'>
              📋
            </span>
            Clinical Clerkship Summary
          </h3>
          <button
            onClick={() => navigator.clipboard.writeText(summary || '')}
            className='text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all'
          >
            Copy to Clipboard
          </button>
        </div>
        <div className='bg-white/60 border border-black/5 p-8 rounded-3xl shadow-sm leading-relaxed text-black/80 font-serif whitespace-pre-wrap'>
          {summary}
        </div>
      </section>

      {/* Differential Diagnoses Section */}
      <section className='space-y-4'>
        <h3 className='text-xl font-bold text-black/70 flex items-center gap-2'>
          <span className='bg-green-100 p-2 rounded-lg text-green-600 text-sm'>
            🧠
          </span>
          Suggested Differentials
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {differentials.map((diff, index) => (
            <div
              key={index}
              className='card-glass border-black/5 p-5 space-y-3 hover:scale-[1.02] transition-transform cursor-pointer'
            >
              <div className='flex justify-between items-start'>
                <h4 className='font-black text-black/80'>{diff.diagnosis}</h4>
                <div className='bg-green-500/10 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase'>
                  {(diff.confidence * 100).toFixed(0)}% Match
                </div>
              </div>
              <p className='text-sm text-black/60 leading-tight'>
                {diff.reasoning}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className='bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-center gap-4'>
        <span className='text-2xl'>⚠️</span>
        <p className='text-xs text-yellow-800 font-medium'>
          **Disclaimer**: This AI-generated content is for educational purposes
          only and should be reviewed by a clinical instructor. It does not
          replace professional medical judgment.
        </p>
      </div>
    </div>
  );
}
