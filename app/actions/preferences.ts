'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AssistanceMode } from '@/lib/types';

export async function getUserPreferences() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  try {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      console.log('Creating default preferences for user:', session.user.id);
      // Create default preferences if they don't exist
      return await prisma.userPreference.create({
        data: {
          userId: session.user.id,
          assistanceMode: 'ASK',
          theme: 'system',
        },
      });
    }

    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

export async function updateUserPreferences(data: {
  assistanceMode?: AssistanceMode;
  theme?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    console.log('Upserting preferences for user:', session.user.id, data);
    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        assistanceMode: data.assistanceMode || 'ASK',
        theme: data.theme || 'system',
      },
    });

    return { success: true, preferences };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { error: 'Failed to update preferences' };
  }
}
