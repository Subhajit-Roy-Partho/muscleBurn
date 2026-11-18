import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'muscleBurn — 3D muscle viewer',
  description:
    'Interactive 3D anatomy viewer for skeletal muscles, with exercise form variations and citations. Educational reference only.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
