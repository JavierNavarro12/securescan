'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Shield, Code, FileSearch, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ScanProgressProps {
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  url: string;
  isCompleting?: boolean;
}

export function ScanProgress({ status, url, isCompleting = false }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const t = useTranslations('scan.progress');

  const scanSteps = [
    { id: 'fetch', label: t('step1'), icon: Globe },
    { id: 'source', label: t('step2'), icon: Code },
    { id: 'keys', label: t('step3'), icon: FileSearch },
    { id: 'headers', label: t('step4'), icon: Lock },
    { id: 'files', label: t('step5'), icon: Shield },
  ];

  useEffect(() => {
    if (isCompleting) {
      setCurrentStep(scanSteps.length);
      setProgress(100);
    }
  }, [isCompleting, scanSteps.length]);

  useEffect(() => {
    if (isCompleting) return;

    if (status === 'scanning' || status === 'pending') {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < scanSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) {
            return prev + Math.random() * 3;
          }
          return prev;
        });
      }, 200);

      return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
      };
    } else if (status === 'completed') {
      setCurrentStep(scanSteps.length);
      setProgress(100);
    }
  }, [status, isCompleting, scanSteps.length]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-3 px-4 py-2 rounded-full mb-4 ${
            isCompleting
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-emerald-500/10 border border-emerald-500/20'
          }`}
        >
          {isCompleting ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          )}
          <span className={`text-sm font-medium ${isCompleting ? 'text-green-400' : 'text-emerald-400'}`}>
            {isCompleting ? t('completed') : t('title')}
          </span>
        </motion.div>

        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {url.replace(/^https?:\/\//, '')}
        </h2>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-[#1a1a25] rounded-full overflow-hidden">
          <motion.div
            className="h-full shimmer rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-500">{t('progress')}</span>
          <span className="text-emerald-400 font-mono">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {scanSteps.map((step, index) => {
            const isStepCompleted = isCompleting || index < currentStep;
            const isCurrent = !isCompleting && index === currentStep && (status === 'scanning' || status === 'pending');
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isStepCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : isCurrent
                    ? 'bg-[#12121a] border-emerald-500/30 glow-subtle'
                    : 'bg-[#12121a]/50 border-white/5'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isStepCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {isStepCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`font-medium transition-colors ${
                    isStepCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>

                {/* Status indicator */}
                {isCurrent && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-auto text-xs text-emerald-400 font-mono"
                  >
                    {t('inProgress')}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Estimated time / Completing message */}
      <p className="text-center text-gray-500 text-sm mt-6">
        {isCompleting ? t('generating') : t('estimatedTime')}
      </p>
    </div>
  );
}
