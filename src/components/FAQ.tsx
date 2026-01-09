'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations('faq');

  const faqs = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? 'bg-[var(--bg-secondary)] border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : 'bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)] hover:border-[var(--border-default)]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <span
                  className={`font-medium transition-colors pr-4 ${
                    isOpen ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 rotate-0'
                      : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <div className="h-px bg-[var(--border-subtle)] mb-4" />
                      <p className="text-zinc-400 leading-relaxed text-[15px]">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
