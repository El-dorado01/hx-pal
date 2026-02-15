'use client';

import React from 'react';
import { useHistory } from '@/lib/HistoryContext';
import { SocialHistoryData, TobaccoHistory, AlcoholHistory } from '@/lib/types';

export default function SocialHistoryStage() {
  const { session, updateSocialHistory, updateTobacco, updateAlcohol } =
    useHistory();
  const { socialHistory } = session.data;
  const { tobacco, alcohol } = socialHistory;

  const calculatePackYears = () => {
    if (tobacco.sticksPerDay && tobacco.years) {
      return ((tobacco.sticksPerDay / 20) * tobacco.years).toFixed(1);
    }
    return 0;
  };

  return (
    <div className='space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12'>
      {/* Tobacco Section */}
      <section className='space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-orange-100 text-orange-600 p-2 rounded-lg'>🚬</div>
          <h3 className='text-xl font-bold text-black/70'>Tobacco Use</h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {['NEVER', 'CURRENT', 'FORMER'].map((status) => (
            <button
              key={status}
              onClick={() => updateTobacco({ status: status as any })}
              className={`py-3 rounded-xl border font-bold transition-all ${
                tobacco.status === status
                  ? 'bg-orange-500 border-orange-600 text-white shadow-lg'
                  : 'bg-white border-black/10 text-black/40 hover:border-black/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {(tobacco.status === 'CURRENT' || tobacco.status === 'FORMER') && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 p-6 rounded-2xl border border-black/5 animate-in zoom-in-95 duration-300'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-black/60'>
                Sticks per Day
              </label>
              <input
                type='number'
                value={tobacco.sticksPerDay || ''}
                onChange={(e) =>
                  updateTobacco({ sticksPerDay: parseInt(e.target.value) || 0 })
                }
                className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/20'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-black/60'>
                Number of Years
              </label>
              <input
                type='number'
                value={tobacco.years || ''}
                onChange={(e) =>
                  updateTobacco({ years: parseInt(e.target.value) || 0 })
                }
                className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/20'
              />
            </div>

            <div className='md:col-span-2 bg-orange-50 p-4 rounded-xl flex justify-between items-center border border-orange-100'>
              <span className='text-orange-700 font-bold text-sm uppercase tracking-wide'>
                Calculated Pack-Years
              </span>
              <span className='text-2xl font-black text-orange-600'>
                {calculatePackYears()}
              </span>
            </div>

            {tobacco.status === 'FORMER' && (
              <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/5 pt-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-black/60'>
                    When did they stop?
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. 2 years ago'
                    value={tobacco.stopped?.when || ''}
                    onChange={(e) =>
                      updateTobacco({
                        stopped: {
                          ...tobacco.stopped!,
                          when: e.target.value,
                          why: tobacco.stopped?.why || '',
                        },
                      })
                    }
                    className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-black/60'>
                    Why did they stop?
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Health concerns'
                    value={tobacco.stopped?.why || ''}
                    onChange={(e) =>
                      updateTobacco({
                        stopped: {
                          ...tobacco.stopped!,
                          why: e.target.value,
                          when: tobacco.stopped?.when || '',
                        },
                      })
                    }
                    className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Alcohol Section */}
      <section className='space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-blue-100 text-blue-600 p-2 rounded-lg'>🍷</div>
          <h3 className='text-xl font-bold text-black/70'>
            Alcohol Consumption
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {['NEVER', 'CURRENT', 'FORMER'].map((status) => (
            <button
              key={status}
              onClick={() => updateAlcohol({ status: status as any })}
              className={`py-3 rounded-xl border font-bold transition-all ${
                alcohol.status === status
                  ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                  : 'bg-white border-black/10 text-black/40 hover:border-black/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {(alcohol.status === 'CURRENT' || alcohol.status === 'FORMER') && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/40 p-6 rounded-2xl border border-black/5 animate-in zoom-in-95 duration-300'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-black/60'>
                Amount per Sitting
              </label>
              <input
                type='text'
                placeholder='e.g. 2 bottles of beer'
                value={alcohol.amountPerSitting || ''}
                onChange={(e) =>
                  updateAlcohol({ amountPerSitting: e.target.value })
                }
                className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-black/60'>
                Freq. per Week
              </label>
              <input
                type='number'
                value={alcohol.frequencyPerWeek || ''}
                onChange={(e) =>
                  updateAlcohol({
                    frequencyPerWeek: parseInt(e.target.value) || 0,
                  })
                }
                className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-black/60'>
                Number of Years
              </label>
              <input
                type='number'
                value={alcohol.years || ''}
                onChange={(e) =>
                  updateAlcohol({ years: parseInt(e.target.value) || 0 })
                }
                className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
              />
            </div>

            {alcohol.status === 'FORMER' && (
              <div className='lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/5 pt-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-black/60'>
                    When did they stop?
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. 6 months ago'
                    value={alcohol.stopped?.when || ''}
                    onChange={(e) =>
                      updateAlcohol({
                        stopped: {
                          ...alcohol.stopped!,
                          when: e.target.value,
                          why: alcohol.stopped?.why || '',
                        },
                      })
                    }
                    className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-black/60'>
                    Why did they stop?
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. New medication'
                    value={alcohol.stopped?.why || ''}
                    onChange={(e) =>
                      updateAlcohol({
                        stopped: {
                          ...alcohol.stopped!,
                          why: e.target.value,
                          when: alcohol.stopped?.when || '',
                        },
                      })
                    }
                    className='w-full bg-white/60 border border-black/10 rounded-xl px-4 py-3 outline-none'
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Others Section */}
      <section className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='space-y-3'>
          <label className='text-lg font-bold text-black/70'>
            Substance Abuse
          </label>
          <textarea
            placeholder='Recreational drugs, IV Drug use, etc.'
            value={socialHistory.substanceAbuse || ''}
            onChange={(e) =>
              updateSocialHistory({ substanceAbuse: e.target.value })
            }
            className='w-full h-32 bg-white/50 border border-black/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none'
          />
        </div>
        <div className='space-y-3'>
          <label className='text-lg font-bold text-black/70'>
            Sexual History
          </label>
          <textarea
            placeholder='Partners, practices, protection, past STIs...'
            value={socialHistory.sexualHistory || ''}
            onChange={(e) =>
              updateSocialHistory({ sexualHistory: e.target.value })
            }
            className='w-full h-32 bg-white/50 border border-black/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none'
          />
        </div>
        <div className='space-y-3'>
          <label className='text-lg font-bold text-black/70'>
            Travel History
          </label>
          <textarea
            placeholder='Recent travel in the last 6 months...'
            value={socialHistory.travelHistory || ''}
            onChange={(e) =>
              updateSocialHistory({ travelHistory: e.target.value })
            }
            className='w-full bg-white/50 border border-black/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none'
          />
        </div>
        <div className='space-y-3'>
          <label className='text-lg font-bold text-black/70'>
            Living Situation
          </label>
          <textarea
            placeholder='Type of housing, number of people, pets, etc.'
            value={socialHistory.livingSituation || ''}
            onChange={(e) =>
              updateSocialHistory({ livingSituation: e.target.value })
            }
            className='w-full h-32 bg-white/50 border border-black/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none'
          />
        </div>
      </section>
    </div>
  );
}
