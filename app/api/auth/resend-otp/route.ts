import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import otpGenerator from 'otp-generator';
import { sendVerificationCode } from '@/lib/send-verification-code';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Rate limiting: check for recent token
    const lastToken = await prisma.verificationToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60000) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 },
      );
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

    return NextResponse.json({ message: 'Verification code resent' });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
