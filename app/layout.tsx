import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TD Admin Panel',
  description: 'Ticket Defender admin panel',
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 5 },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
