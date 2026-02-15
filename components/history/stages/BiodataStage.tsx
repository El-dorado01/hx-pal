'use client';

import React from 'react';
import { useHistory } from '@/lib/HistoryContext';

export default function BiodataStage() {
  const { session, updateBiodata } = useHistory();
  const { biodata } = session.data;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    updateBiodata({ [name]: name === 'age' ? parseInt(value) || 0 : value });
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>Name</label>
        <input
          type='text'
          name='name'
          value={biodata.name || ''}
          onChange={handleChange}
          placeholder='Full Name'
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>Age</label>
        <input
          type='number'
          name='age'
          value={biodata.age || ''}
          onChange={handleChange}
          placeholder='Age in years'
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>
          Sex / Gender
        </label>
        <select
          name='gender'
          value={biodata.gender || ''}
          onChange={handleChange}
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        >
          <option value=''>Select Gender</option>
          <option value='male'>Male</option>
          <option value='female'>Female</option>
          <option value='other'>Other</option>
        </select>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>
          Tribe (Optional)
        </label>
        <input
          type='text'
          name='tribe'
          value={biodata.tribe || ''}
          onChange={handleChange}
          placeholder='Ethnic group'
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>
          Religion (Optional)
        </label>
        <input
          type='text'
          name='religion'
          value={biodata.religion || ''}
          onChange={handleChange}
          placeholder='Religious affiliation'
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>
          Occupation
        </label>
        <input
          type='text'
          name='occupation'
          value={biodata.occupation || ''}
          onChange={handleChange}
          placeholder='Profession'
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>
          Marital Status
        </label>
        <select
          name='maritalStatus'
          value={biodata.maritalStatus || ''}
          onChange={handleChange}
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
        >
          <option value=''>Select Status</option>
          <option value='single'>Single</option>
          <option value='married'>Married</option>
          <option value='divorced'>Divorced</option>
          <option value='widowed'>Widowed</option>
          <option value='separated'>Separated</option>
        </select>
      </div>

      <div className='space-y-2 md:col-span-2'>
        <label className='text-sm font-medium text-black/60 ml-1'>
          Address (Optional)
        </label>
        <textarea
          name='address'
          value={biodata.address || ''}
          onChange={handleChange}
          placeholder='Residential address'
          rows={2}
          className='w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none'
        />
      </div>
    </div>
  );
}
