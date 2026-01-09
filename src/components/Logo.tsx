'use client';

import { Shield } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Shield
          className={`${sizeClasses[size]} text-cyan-400 shield-glow`}
          strokeWidth={2}
        />
        <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
      </div>
      {showText && (
        <span
          className={`font-semibold ${textClasses[size]} tracking-tight`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="text-white">Secure</span>
          <span className="text-cyan-400">Scan</span>
        </span>
      )}
    </div>
  );
}
