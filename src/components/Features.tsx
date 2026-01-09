'use client';

import { motion } from 'framer-motion';
import { Link2, Search, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Features() {
  const t = useTranslations('features');

  const steps = [
    {
      icon: Link2,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: Search,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: Shield,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="relative group"
          >
            {/* Connector line (except last) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px">
                <div className="w-full h-full bg-gradient-to-r from-emerald-500/30 to-transparent" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
              </div>
            )}

            <div className="relative p-6 card group-hover:border-emerald-500/20 h-full">
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[var(--bg-primary)] border border-emerald-500/30 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-emerald-500/10 transition-all group-hover:bg-emerald-500/20 group-hover:scale-110">
                <Icon className="w-7 h-7 text-emerald-400" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
