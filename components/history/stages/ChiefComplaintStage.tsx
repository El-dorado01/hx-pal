'use client';

import React, { useState } from 'react';
import { useHistory } from '@/lib/HistoryContext';
import { MEDICAL_SYSTEMS } from '@/lib/types';

export default function ChiefComplaintStage() {
  const { session, addChiefComplaint, removeChiefComplaint, updateCCSystem } =
    useHistory();
  const { chiefComplaints } = session.data;
  const [newCC, setNewCC] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCC.trim() && chiefComplaints.length < 5) {
      addChiefComplaint(newCC.trim());
      setNewCC('');
    }
  };

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <form
        onSubmit={handleAdd}
        className='space-y-4'
      >
        <label className='text-sm font-medium text-black/60 ml-1'>
          Add Complaint (Max 5)
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            value={newCC}
            onChange={(e) => setNewCC(e.target.value)}
            placeholder='e.g. Chest pain for 2 days'
            disabled={chiefComplaints.length >= 5}
            className='flex-1 bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50'
          />
          <button
            type='submit'
            disabled={!newCC.trim() || chiefComplaints.length >= 5}
            className='bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50'
          >
            Add
          </button>
        </div>
      </form>

      <div className='space-y-3'>
        {chiefComplaints.map((cc, index) => (
          <div
            key={index}
            className='bg-white/40 border border-black/5 p-4 rounded-xl flex flex-col gap-3 shadow-sm'
          >
            <div className='flex justify-between items-center'>
              <span className='font-medium'>
                #{index + 1}: {cc.text}
              </span>
              <button
                onClick={() => removeChiefComplaint(index)}
                className='text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-all'
              >
                ✕
              </button>
            </div>

            <div className='flex items-center gap-3'>
              <label className='text-[10px] uppercase font-bold text-black/40 tracking-wider'>
                System:
              </label>
              <div className='flex flex-wrap gap-2'>
                {MEDICAL_SYSTEMS.map((system) => (
                  <button
                    key={system}
                    onClick={() => updateCCSystem(index, system)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                      cc.system === system
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white border-black/10 text-black/60 hover:border-black/20'
                    }`}
                  >
                    {system}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {chiefComplaints.length === 0 && (
          <div className='text-center py-12 border border-dashed border-black/10 rounded-2xl text-black/20 bg-black/1'>
            Please add the patient's chief complaints.
          </div>
        )}
      </div>
    </div>
  );
}
