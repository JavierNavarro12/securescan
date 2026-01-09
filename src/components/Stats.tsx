'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Bug, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatsProps {
  initialScans?: number;
  initialVulnerabilities?: number;
}

export function Stats({
  initialScans = 10000,
  initialVulnerabilities = 45000,
}: StatsProps) {
  const [stats, setStats] = useState({
    scans: initialScans,
    vulnerabilities: initialVulnerabilities,
  });
  const t = useTranslations('stats');

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats({
            scans: Math.max(data.stats.scans, initialScans),
            vulnerabilities: Math.max(data.stats.vulnerabilities, initialVulnerabilities),
          });
        }
      })
      .catch(() => {});
  }, [initialScans, initialVulnerabilities]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    }
    return num.toString();
  };

  const statItems = [
    {
      icon: Scan,
      value: formatNumber(stats.scans),
      label: t('scans'),
      color: 'var(--accent-primary)',
      bgColor: 'var(--accent-muted)',
    },
    {
      icon: Bug,
      value: formatNumber(stats.vulnerabilities),
      label: t('keysFound'),
      color: 'var(--severity-critical)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
      icon: Shield,
      value: '40+',
      label: t('providers'),
      color: 'var(--accent-secondary)',
      bgColor: 'var(--accent-muted)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative text-center p-8 card hover:glow-subtle"
          >
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
              <div
                className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)`
                }}
              />
            </div>

            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 transition-transform group-hover:scale-110"
              style={{ background: item.bgColor }}
            >
              <Icon className="w-7 h-7" style={{ color: item.color }} />
            </div>

            <div
              className="text-5xl font-bold mb-3 font-mono tracking-tight"
              style={{ color: item.color }}
            >
              {item.value}
            </div>

            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">
              {item.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
