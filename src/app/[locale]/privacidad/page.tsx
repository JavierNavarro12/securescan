'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function PrivacidadPage() {
  const t = useTranslations('legal.privacy');
  const tCommon = useTranslations('legal.common');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
          </div>

          <div className="prose prose-invert prose-gray max-w-none">
            <p className="text-gray-400 text-lg mb-8">
              {tCommon('lastUpdated')}: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('section1.title')}</h2>
              <p className="text-gray-300 mb-4">{t('section1.intro')}</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>{t('section1.item1')}</li>
                <li>{t('section1.item2')}</li>
                <li>{t('section1.item3')}</li>
                <li>{t('section1.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('section2.title')}</h2>
              <p className="text-gray-300 mb-4">{t('section2.intro')}</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>{t('section2.item1')}</li>
                <li>{t('section2.item2')}</li>
                <li>{t('section2.item3')}</li>
                <li>{t('section2.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('section3.title')}</h2>
              <p className="text-gray-300">{t('section3.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('section4.title')}</h2>
              <p className="text-gray-300">{t('section4.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('section5.title')}</h2>
              <p className="text-gray-300 mb-4">{t('section5.intro')}</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>{t('section5.item1')}</li>
                <li>{t('section5.item2')}</li>
                <li>{t('section5.item3')}</li>
                <li>{t('section5.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('section6.title')}</h2>
              <p className="text-gray-300">
                {t('section6.content')}{' '}
                <a href="mailto:navarrojavi107@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                  navarrojavi107@gmail.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
