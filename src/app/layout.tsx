import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecureScan - Detecta API Keys Expuestas en tu Web',
  description:
    'Escanea tu sitio web en busca de API keys expuestas, credenciales filtradas y vulnerabilidades de seguridad. Protege tu aplicación antes de que sea demasiado tarde.',
  keywords: [
    'security scanner',
    'api key detector',
    'vulnerability scanner',
    'exposed credentials',
    'web security',
    'openai key leak',
    'stripe key exposed',
  ],
  authors: [{ name: 'SecureScan' }],
  openGraph: {
    title: 'SecureScan - Detecta API Keys Expuestas en tu Web',
    description:
      'Tu app está filtrando API keys. Descúbrelo antes que un hacker. Escaneo gratuito en 30 segundos.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecureScan - Detecta API Keys Expuestas',
    description: 'Tu app está filtrando API keys. Descúbrelo antes que un hacker.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased noise-overlay">
        {/* Scan line effect */}
        <div className="scan-line" />

        {/* Main content */}
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
