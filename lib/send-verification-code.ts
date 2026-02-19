import { sendEmail } from './emailConfig';

export const sendVerificationCode = async ({
  email,
  code,
  type = 'signup',
}: {
  email: string;
  code: string;
  type?: 'signup' | 'reset';
}) => {
  if (!email) {
    throw new Error('An email must be provided');
  }

  // Email sending logic
  if (email) {
    try {
      console.log(`[Email] Preparing to send ${type} code to: ${email}`);
      const logoColor = '#4a5d23'; // Army Green
      const backgroundColor = '#f7f9f6'; // Light Sage

      let subject = 'Verify Your Hx Pal Account';
      let title = 'Verify Your Account';
      let message =
        'Thank you for getting started with Hx Pal! Please use the verification code below to complete your registration and secure your account.';

      if (type === 'reset') {
        subject = 'Reset Your Hx Pal Password';
        title = 'Reset Your Password';
        message =
          'We received a request to reset your password. Use the code below to proceed. If you did not make this request, your account is safe and you can ignore this email.';
      }

      const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: 'Ubuntu', Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td style="padding: 30px 40px; background-color: ${logoColor}; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">HX Pal</h1>
            </td>
        </tr>
        <!-- Body -->
        <tr>
            <td style="padding: 40px 40px 30px;">
                <h2 style="color: #1a202c; margin-top: 0; font-size: 22px; font-weight: 700;">${title}</h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    ${message}
                </p>
                <div style="background-color: ${backgroundColor}; border: 1px dashed ${logoColor}; border-radius: 6px; padding: 24px; text-align: center; margin: 32px 0;">
                    <span style="font-size: 36px; font-weight: bold; color: ${logoColor}; letter-spacing: 6px; font-family: monospace;">${code}</span>
                </div>
                <p style="color: #718096; font-size: 14px; margin-top: 24px; line-height: 1.5;">
                    This code will expire in 10 minutes. If you did not request this code, please ignore this email.
                </p>
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td style="padding: 24px; background-color: #edf2f7; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Hx Pal. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
      `;

      await sendEmail({
        to: email,
        subject: subject,
        text: `${message} Your code is: ${code}.`,
        html: htmlTemplate,
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
