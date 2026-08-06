import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Church Availability',
  description: 'Submit your service availability and build the roster.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
