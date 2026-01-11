import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'MATT BRECKON — software developer',
  description: 'Personal website',
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
