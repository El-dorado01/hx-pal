'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import { sendVerificationCode } from '@/lib/send-verification-code';
import { login, logout as authLogout, getSession } from '@/lib/auth';

export async function registerAction(data: any) {
  try {
    const { email, password, name } = data;

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        email,
        token: otp,
        expires,
        userId: user.id,
      },
    });

    await sendVerificationCode({ email, code: otp });

    return { success: true, message: 'User created. OTP sent.' };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function verifyOtpAction(data: { email: string; token: string }) {
  try {
    const { email, token } = data;

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token,
        expires: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verificationToken) {
      return { error: 'Invalid or expired OTP' };
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    const { user } = verificationToken;
    await login({ id: user.id, email: user.email, name: user.name });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Internal server error' };
  }
}

export async function loginAction(data: any) {
  try {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { error: 'Invalid email or password' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: 'Invalid email or password' };
    }

    if (!user.emailVerified) {
      return { error: 'Email not verified', unverified: true };
    }

    await login({ id: user.id, email: user.email, name: user.name });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Internal server error' };
  }
}

export async function resendOtpAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Rate limiting: check for recent token
    const lastToken = await prisma.verificationToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60000) {
      return { error: 'Please wait 60 seconds' };
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        email,
        token: otp,
        expires,
        userId: user.id,
      },
    });

    await sendVerificationCode({ email, code: otp });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Internal server error' };
  }
}

export async function logoutAction() {
  await authLogout();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function forgotPasswordAction(data: { email: string }) {
  try {
    const { email } = data;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists
      return { success: true };
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        email,
        token: otp,
        expires,
        userId: user.id,
      },
    });

    await sendVerificationCode({ email, code: otp });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Internal server error' };
  }
}

export async function resetPasswordAction(data: {
  email: string;
  token: string;
  password: string;
}) {
  try {
    const { email, token, password } = data;

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return { error: 'Invalid or expired reset code' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Internal server error' };
  }
}

export async function deleteAccountAction() {
  try {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    await authLogout();

    return { success: true };
  } catch (error: any) {
    console.error('Delete account error:', error);
    return { error: 'Failed to delete account' };
  }
}

export async function updateProfileAction(data: { name: string }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function updatePasswordAction(data: {
  currentPass: string;
  newPass: string;
}) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) return { error: 'User not found' };

    const isMatch = await bcrypt.compare(data.currentPass, user.password);
    if (!isMatch) return { error: 'Incorrect current password' };

    const hashedNewPassword = await bcrypt.hash(data.newPass, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Update password error:', error);
    return { error: 'Failed to update password' };
  }
}
