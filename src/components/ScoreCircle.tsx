'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ScoreCircleProps {
  score: number;
  size?: number;
}

export function ScoreCircle({ score, size = 200 }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const t = useTranslations('results');

  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 80) return { main: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' };
    if (s >= 60) return { main: '#84cc16', glow: 'rgba(132, 204, 22, 0.3)' };
    if (s >= 40) return { main: '#eab308', glow: 'rgba(234, 179, 8, 0.3)' };
    if (s >= 20) return { main: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' };
    return { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' };
  };

  const getLabel = (s: number) => {
    if (s >= 80) return t('scoreExcellent');
    if (s >= 60) return t('scoreGood');
    if (s >= 40) return t('scoreModerate');
    if (s >= 20) return t('scoreAtRisk');
    return t('scoreCritical');
  };

  const color = getColor(score);
  const label = getLabel(score);

  // Circle calculations
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    // Animate score counting
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-50"
        style={{ background: color.glow }}
      />

      {/* SVG Circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.main}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 10px ${color.glow})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: color.main,
            textShadow: `0 0 30px ${color.glow}`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {animatedScore}
        </motion.span>
        <span className="text-gray-400 text-sm mt-1">{t('score')}</span>
        <motion.span
          className="mt-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: `${color.main}20`,
            color: color.main,
            border: `1px solid ${color.main}40`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
}
