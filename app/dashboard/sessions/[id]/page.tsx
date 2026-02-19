'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SummaryView } from '@/components/session/summary-view';
import { SessionProvider, useSession } from '@/lib/SessionContext';
import { Loader2 } from 'lucide-react';

function SessionReviewContent() {
  const { id } = useParams();
  const router = useRouter();
  const { loadSessionFromDb, sessionId, status } = useSession();

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadSessionFromDb(id);
    }
  }, [id, loadSessionFromDb]);

  if (!sessionId) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
        <p className='text-muted-foreground font-medium'>
          Loading clinical session...
        </p>
      </div>
    );
  }

  return <SummaryView readOnly={true} />;
}

export default function SessionReviewPage() {
  return (
    <SessionProvider>
      <SessionReviewContent />
    </SessionProvider>
  );
}
