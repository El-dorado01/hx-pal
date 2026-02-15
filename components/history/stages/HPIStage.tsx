'use client';

import React, { useState } from 'react';
import { useHistory } from '@/lib/HistoryContext';
import { SocratesData, FiveCsData } from '@/lib/types';

export default function HPIStage() {
  const { session, updateFiveCs } = useHistory();
  const { chiefComplaints, hpi } = session.data;
  const [activeCCIndex, setActiveCCIndex] = useState(0);

  if (chiefComplaints.length === 0) {
    return (
      <div className='text-center py-12 card-glass text-black/40'>
        Please enter at least one Chief Complaint first.
      </div>
    );
  }

  const currentHpi = hpi[activeCCIndex] || {
    character: '',
    course: '',
    cause: '',
    complications: '',
    careGiven: '',
  };

  const handleUpdate = (field: keyof FiveCsData, value: any) => {
    updateFiveCs(activeCCIndex, { [field]: value });
  };

  const handleSocratesUpdate = (field: keyof SocratesData, value: string) => {
    const existingCharacter =
      typeof currentHpi.character === 'object' ? currentHpi.character : {};
    handleUpdate('character', { ...existingCharacter, [field]: value });
  };

  const isPainRelated = chiefComplaints[activeCCIndex]?.text
    .toLowerCase()
    .includes('pain');

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* CC Selector Tabs */}
      <div className='flex gap-2 p-1 bg-black/5 rounded-2xl overflow-x-auto scrollbar-hide'>
        {chiefComplaints.map((cc, index) => (
          <button
            key={index}
            onClick={() => setActiveCCIndex(index)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCCIndex === index
                ? 'bg-white shadow-sm text-primary'
                : 'text-black/40 hover:text-black/60'
            }`}
          >
            CC #{index + 1}:{' '}
            {cc.text.length > 20 ? cc.text.substring(0, 17) + '...' : cc.text}
          </button>
        ))}
      </div>

      <div className='space-y-8'>
        {/* Character Section */}
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <span className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm'>
              1
            </span>
            <h3 className='font-bold text-black/70'>Character (5 Cs)</h3>
          </div>

          {isPainRelated ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/40 p-5 rounded-2xl border border-black/5'>
              <p className='md:col-span-2 text-xs font-bold text-primary/60 uppercase tracking-widest mb-2'>
                SOCRATES Analysis (Pain)
              </p>
              {[
                'site',
                'onset',
                'character',
                'radiation',
                'associations',
                'timeCourse',
                'exacerbatingFactors',
                'severity',
              ].map((field) => (
                <div
                  key={field}
                  className='space-y-1'
                >
                  <label className='text-[10px] font-bold text-black/40 uppercase ml-1'>
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type='text'
                    placeholder={`Enter ${field}...`}
                    value={
                      (currentHpi.character as SocratesData)?.[
                        field as keyof SocratesData
                      ] || ''
                    }
                    onChange={(e) =>
                      handleSocratesUpdate(
                        field as keyof SocratesData,
                        e.target.value,
                      )
                    }
                    className='w-full bg-white/60 border border-black/5 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary/20 outline-none'
                  />
                </div>
              ))}
            </div>
          ) : (
            <textarea
              placeholder='Characterize the symptom in detail...'
              value={
                typeof currentHpi.character === 'string'
                  ? currentHpi.character
                  : ''
              }
              onChange={(e) => handleUpdate('character', e.target.value)}
              className='w-full h-32 bg-white/50 border border-black/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all'
            />
          )}
        </section>

        {/* Other 4 Cs */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {[
            {
              id: 'course',
              label: 'Course',
              prompt: 'Is it getting better, worse, or fluctuating?',
            },
            {
              id: 'cause',
              label: 'Cause',
              prompt: 'What does the patient think caused this?',
            },
            {
              id: 'complications',
              label: 'Complications',
              prompt: 'Any associated issues or functional impact?',
            },
            {
              id: 'careGiven',
              label: 'Care Given',
              prompt: 'Any medications or home remedies tried?',
            },
          ].map((c, idx) => (
            <section
              key={c.id}
              className='space-y-3'
            >
              <div className='flex items-center gap-2'>
                <span className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm'>
                  {idx + 2}
                </span>
                <h3 className='font-bold text-black/70'>{c.label}</h3>
              </div>
              <textarea
                placeholder={c.prompt}
                value={(currentHpi as any)[c.id] || ''}
                onChange={(e) =>
                  handleUpdate(c.id as keyof FiveCsData, e.target.value)
                }
                className='w-full h-24 bg-white/50 border border-black/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all'
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
