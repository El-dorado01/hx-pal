import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google';
import { Toaster } from 'sonner';
import { ProgressBar } from '@/components/progress-bar';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const ubuntu = Ubuntu({
  variable: '--font-ubuntu',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'HX Pal | Your Clinical Clerkship Companion',
  description:
    'A sophisticated clinical clerkship companion for medical students, providing real-time hints, structured history taking, and AI-driven clinical synthesis.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${ubuntu.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
