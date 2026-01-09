'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Bug, Shield } from 'lucide-react';

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

  useEffect(() => {
    // Fetch real stats
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
      .catch(() => {
        // Keep initial values on error
      });
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
      label: 'Sitios escaneados',
      color: '#00d4ff',
    },
    {
      icon: Bug,
      value: formatNumber(stats.vulnerabilities),
      label: 'Vulnerabilidades encontradas',
      color: '#ef4444',
    },
    {
      icon: Shield,
      value: '15+',
      label: 'Tipos de API keys',
      color: '#10b981',
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
            className="text-center p-6 bg-[#12121a]/50 border border-white/5 rounded-2xl"
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: `${item.color}15` }}
            >
              <Icon className="w-6 h-6" style={{ color: item.color }} />
            </div>
            <div
              className="text-4xl font-bold mb-2"
              style={{
                color: item.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {item.value}
            </div>
            <p className="text-gray-400 text-sm">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
