import React from 'react';
import { DashboardSearch } from '@/components/dashboard-search';

export default function DashboardPage() {
  return (
    <div className='flex flex-col flex-1 bg-background'>
      <div className='flex items-center justify-center flex-1 w-full'>
        <DashboardSearch />
      </div>
    </div>
  );
}
