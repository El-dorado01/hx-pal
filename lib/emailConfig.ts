import nodemailer from 'nodemailer';
import axios from 'axios';

const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = 587; // Usually 587 for TLS
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS; // Using SMTP_PASS as it looks like the API key/Password
const fromEmail = process.env.EMAIL_USER;

// API Config
const brevoApiKey = process.env.BREVO_API_KEY;
const emailServiceType = process.env.EMAIL_SERVICE_TYPE || 'smtp'; // 'api' or 'smtp'

if (!user || !pass || !fromEmail) {
  console.warn(
    'WARNING: Email configuration (SMTP_USER, SMTP_PASS) is missing from .env',
  );
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false, // STARTTLS
  auth: {
    user,
    pass,
  },
});

export const fromHeader = `"HX Pal" <${fromEmail}>`;

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailOptions) => {
  if (emailServiceType === 'smtp') {
    return sendViaSmtp({ to, subject, text, html });
  } else {
    return sendViaBrevoApi({ to, subject, text, html });
  }
};

async function sendViaBrevoApi({ to, subject, text, html }: SendEmailOptions) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'HX Pal', email: fromEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html || text,
        textContent: text || 'Please enable HTML to view this email properly.',
      },
      {
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      '[Email-API] Brevo API Error:',
      error.response?.data || error.message,
    );
    throw new Error(`Failed to send email via API: ${error.message}`);
  }
}

async function sendViaSmtp({ to, subject, text, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error: any) {
    console.error('[Email-SMTP] SMTP Error:', error.message);
    throw new Error(`Failed to send email via SMTP: ${error.message}`);
  }
}
