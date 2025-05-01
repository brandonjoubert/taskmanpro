import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Assuming these fonts are intended
import './globals.css';
// import { Toaster } from "@/components/ui/toaster" // Uncomment if using toasts

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Risk Quadrant Scheduler', // Updated App Title
  description: 'Manage tasks using Eisenhower Matrix and Risk Assessment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        {/* <Toaster /> */} {/* Uncomment to enable toast notifications */}
      </body>
    </html>
  );
}
