'use client';

import { useState } from 'react';
import { Search, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function ScanInput() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError(t('scan.error.invalidUrl'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || t('scan.error.scanError'));
        setIsLoading(false);
        return;
      }

      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      setError(t('scan.error.connectionError'));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />

        {/* Input container */}
        <div className="relative flex items-center bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden group-hover:border-emerald-500/30 group-focus-within:border-emerald-500/50 transition-colors duration-300">
          {/* Search icon */}
          <div className="pl-5 pr-3">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('hero.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1 py-4 bg-transparent text-white placeholder-zinc-500 focus:outline-none font-medium text-lg font-mono disabled:opacity-50"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="m-2 px-6 py-3 btn-primary rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">{t('common.scanning')}</span>
              </>
            ) : (
              <>
                <span>{t('common.scan')}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm fade-in-up">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      <p className="mt-4 text-center text-zinc-500 text-sm">
        {t('hero.inputHelper')}
      </p>
    </form>
  );
}
