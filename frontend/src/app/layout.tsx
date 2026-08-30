import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZF Centre for Automotive Innovation | Telematics Portal',
  description: 'Mobility Systems Hub & Autonomous Testbed Telematics Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}