import { sendEmail } from './emailConfig';

export const sendVerificationCode = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  if (!email) {
    throw new Error('An email must be provided');
  }

  // Email sending logic
  if (email) {
    try {
      console.log(`[Email] Preparing to send verification code to: ${email}`);
      await sendEmail({
        to: email,
        subject: 'Verify Your HX-Pal Account',
        text: `Your verification code is: ${code}. It expires in 10 minutes. If you didn't request this, ignore it.`,
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes. If you didn't request this, ignore it.</p>`,
      });
    } catch (error: any) {
      console.error('[Email] Delivery Error:', {
        message: error.message,
        recipient: email,
      });
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
};
