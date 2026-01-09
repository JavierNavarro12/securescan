'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PaywallCardProps {
  scanId: string;
}

export function PaywallCard({ scanId }: PaywallCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('results.paywall');

  const handleUnlock = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || t('errorPayment'));
        setIsLoading(false);
      }
    } catch {
      alert(t('errorConnection'));
      setIsLoading(false);
    }
  };

  const benefits = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl" />

      <div className="relative m-[1px] bg-[#12121a] rounded-2xl p-8">
        {/* Top badge */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-lg">
            <span className="text-xs font-semibold text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t('recommended')}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {t('title')}
          </h3>
          <p className="text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-5 h-5 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-gray-300">{benefit}</span>
            </motion.div>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="text-center">
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">{t('currency')}{t('price')}</span>
            <span className="text-gray-500 ml-2">{t('priceNote')}</span>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="btn-glow w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                {t('button')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            {t('securePayment')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
