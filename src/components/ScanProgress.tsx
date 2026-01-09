'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Shield, Code, FileSearch, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanProgressProps {
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  url: string;
}

const scanSteps = [
  { id: 'fetch', label: 'Cargando página web', icon: Globe },
  { id: 'source', label: 'Analizando código fuente', icon: Code },
  { id: 'keys', label: 'Buscando API keys expuestas', icon: FileSearch },
  { id: 'headers', label: 'Verificando headers de seguridad', icon: Lock },
  { id: 'files', label: 'Comprobando archivos sensibles', icon: Shield },
];

export function ScanProgress({ status, url }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'scanning') {
      // Simulate step progression
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < scanSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);

      // Simulate progress
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
  }, [status]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4"
        >
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">Escaneando</span>
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
          <span className="text-gray-500">Progreso</span>
          <span className="text-cyan-400 font-mono">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {scanSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep && status === 'scanning';
            const isPending = index > currentStep;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-cyan-500/5 border-cyan-500/20'
                    : isCurrent
                    ? 'bg-[#12121a] border-cyan-500/30 glow-cyan-subtle'
                    : 'bg-[#12121a]/50 border-white/5'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : isCurrent
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
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
                    isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>

                {/* Status indicator */}
                {isCurrent && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-auto text-xs text-cyan-400 font-mono"
                  >
                    en progreso...
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Estimated time */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Tiempo estimado: ~30 segundos
      </p>
    </div>
  );
}
