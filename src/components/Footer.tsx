'use client';

import { Logo } from './Logo';
import { Github, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Logo size="sm" />

          <nav className="flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/privacidad" className="hover:text-white transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terminos" className="hover:text-white transition-colors">
              {t('terms')}
            </Link>
            <a href="mailto:navarrojavi107@gmail.com" className="hover:text-white transition-colors">
              {t('contact')}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] text-center">
          <p className="text-zinc-500 text-sm">
            {t('copyright')}
          </p>
          <p className="mt-2 text-zinc-600 text-sm">
            {t('tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
