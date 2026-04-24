/**
 * Layout raíz de Mobidurango App
 *
 * Este archivo define la estructura HTML común a TODAS las páginas.
 * Metatags, favicon, fuentes, etc.
 */
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobidurango · Egutegia eta aplikazioa',
  description:
    'Mobidurango Durangoko biztanleentzako jarduera fisikoaren orientazio zerbitzua da. Egutegi osoa, ekitaldi bereziak eta kudeaketa plataforma.',
  keywords: ['Mobidurango', 'Durango', 'jarduera fisikoa', 'osasuna', 'ohitura osasuntsuak'],
  authors: [{ name: 'Durangoko Udala' }],
  openGraph: {
    title: 'Mobidurango',
    description: 'Durangoko jarduera fisikoaren orientazio zerbitzua',
    locale: 'eu_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="eu">
      <body>{children}</body>
    </html>
  );
}
