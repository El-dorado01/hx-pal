'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveSessionAction(data: {
  id?: string;
  status?: string;
  mode?: string;
  currentStage?: string;
  data: any;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const dbSession = await prisma.session.upsert({
      where: { id: data.id || 'new' }, // 'new' is just a placeholder to trigger creation if no ID is provided
      update: {
        status: data.status,
        mode: data.mode,
        currentStage: data.currentStage,
        data: data.data,
      },
      create: {
        userId: session.user.id,
        status: data.status || 'ACTIVE',
        mode: data.mode || 'ASK',
        currentStage: data.currentStage || 'BIODATA',
        data: data.data,
      },
    });

    revalidatePath('/dashboard/sessions');
    return { success: true, session: dbSession };
  } catch (error: any) {
    console.error('Error saving session:', error);
    return { error: 'Failed to save session' };
  }
}

export async function getSessionsAction() {
  const session = await getSession();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const sessions = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, sessions };
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return { error: 'Failed to fetch sessions' };
  }
}

export async function getSessionByIdAction(id: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const dbSession = await prisma.session.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!dbSession) return { error: 'Session not found' };

    return { success: true, session: dbSession };
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return { error: 'Failed to fetch session' };
  }
}

export async function deleteSessionAction(id: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await prisma.session.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath('/dashboard/sessions');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting session:', error);
    return { error: 'Failed to delete session' };
  }
}
