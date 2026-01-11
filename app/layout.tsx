import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MATT BRECKON — software developer',
  description: 'Personal website'
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
