import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    es: 'SecureScan - Detecta API Keys Expuestas en tu Web',
    en: 'SecureScan - Detect Exposed API Keys on Your Website',
    fr: 'SecureScan - Détectez les Clés API Exposées sur Votre Site',
    de: 'SecureScan - Erkennen Sie Exponierte API-Schlüssel auf Ihrer Website',
    pt: 'SecureScan - Detecte Chaves API Expostas no Seu Site',
    ja: 'SecureScan - ウェブサイトの公開APIキーを検出',
  };

  const descriptions: Record<string, string> = {
    es: 'Escanea tu sitio web en busca de API keys expuestas, credenciales filtradas y vulnerabilidades de seguridad.',
    en: 'Scan your website for exposed API keys, leaked credentials, and security vulnerabilities.',
    fr: 'Analysez votre site web à la recherche de clés API exposées, d\'identifiants divulgués et de vulnérabilités.',
    de: 'Scannen Sie Ihre Website nach exponierten API-Schlüsseln, durchgesickerten Anmeldedaten und Sicherheitslücken.',
    pt: 'Escaneie seu site em busca de chaves API expostas, credenciais vazadas e vulnerabilidades de segurança.',
    ja: 'ウェブサイトをスキャンして、公開されたAPIキー、漏洩した認証情報、セキュリティ脆弱性を検出します。',
  };

  return {
    title: titles[locale] || titles.es,
    description: descriptions[locale] || descriptions.es,
    keywords: [
      'security scanner',
      'api key detector',
      'vulnerability scanner',
      'exposed credentials',
      'web security',
    ],
    authors: [{ name: 'SecureScan' }],
    openGraph: {
      title: titles[locale] || titles.es,
      description: descriptions[locale] || descriptions.es,
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.es,
      description: descriptions[locale] || descriptions.es,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-[#09090b] text-white antialiased grain-overlay">
        <div className="scan-line" />
        <NextIntlClientProvider messages={messages}>
          <main className="relative">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
