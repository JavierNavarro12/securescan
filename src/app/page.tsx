'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Check, ArrowRight, Sparkles } from 'lucide-react';
import {
  Logo,
  ScanInput,
  Features,
  Stats,
  FAQ,
  ProviderLogos,
  Footer,
} from '@/components';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 radial-gradient-top pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-4 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Cómo funciona
            </a>
            <a
              href="#faq"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-20 pb-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-10"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300 font-medium">
              El 73% de las apps filtran credenciales sensibles
            </span>
          </motion.div>

          {/* Main headline - Serif display font */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-title font-display text-5xl md:text-7xl mb-6 leading-[1.1] tracking-tight"
          >
            Tu app está filtrando{' '}
            <span className="gradient-text">API keys</span>
            <span className="text-emerald-400">.</span>
            <br />
            <span className="text-zinc-500 italic">Descúbrelo antes que un hacker.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Escaneamos tu sitio web en busca de API keys expuestas, archivos sensibles
            y configuraciones inseguras.{' '}
            <span className="text-white font-medium">Gratis en 30 segundos.</span>
          </motion.p>

          {/* Scan input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScanInput />
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Sin registro</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Resultados inmediatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>100% privado</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Provider logos */}
      <section className="relative z-10 px-4 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <ProviderLogos />
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Stats />
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="relative z-10 px-4 py-24 bg-[var(--bg-secondary)]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge badge-accent mb-4 inline-block">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Simple y rápido
            </span>
            <h2 className="font-display text-4xl md:text-5xl mb-4">Cómo funciona</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              De URL a reporte de seguridad en menos de un minuto
            </p>
          </motion.div>

          <Features />
        </div>
      </section>

      {/* What we detect */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge badge-warning mb-4 inline-block">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              +40 tipos de vulnerabilidades
            </span>
            <h2 className="font-display text-4xl md:text-5xl mb-4">Qué detectamos</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Un análisis completo de tu seguridad frontend
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'API Keys Expuestas',
                items: ['OpenAI, Anthropic, Cohere', 'Stripe (live/test)', 'AWS, Firebase, Google', 'GitHub, Supabase, Vercel'],
                severity: 'critical',
              },
              {
                title: 'Archivos Sensibles',
                items: ['.env, .git expuestos', 'config.js, settings.json', 'credentials, secrets', 'database configs'],
                severity: 'high',
              },
              {
                title: 'Headers de Seguridad',
                items: ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'X-Content-Type-Options'],
                severity: 'medium',
              },
              {
                title: 'Otras Vulnerabilidades',
                items: ['Source maps expuestos', 'CORS mal configurado', 'Tokens en URLs', 'Mixed content HTTP'],
                severity: 'low',
              },
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  category.severity === 'critical'
                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                    : category.severity === 'high'
                    ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40'
                    : category.severity === 'medium'
                    ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
                    : 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      category.severity === 'critical'
                        ? 'bg-red-500'
                        : category.severity === 'high'
                        ? 'bg-orange-500'
                        : category.severity === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <h3 className="font-semibold text-white">{category.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {category.items.map((item) => (
                    <li key={item} className="text-sm text-zinc-400 flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-zinc-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20"
          >
            <div className="w-20 h-20 mx-auto mb-8 bg-emerald-500/20 rounded-2xl flex items-center justify-center glow-accent">
              <Shield className="w-10 h-10 text-emerald-400 shield-glow" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-4">
              ¿Listo para proteger tu app?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
              No esperes a que alguien descubra tus vulnerabilidades. Escanea ahora.
            </p>
            <a
              href="#top"
              className="inline-flex items-center gap-2 px-8 py-4 btn-primary rounded-xl text-lg"
            >
              Escanear mi sitio gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-4 py-24 bg-[var(--bg-secondary)]/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-zinc-400 text-lg">
              Todo lo que necesitas saber sobre SecureScan
            </p>
          </motion.div>

          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
