'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Check, ArrowRight } from 'lucide-react';
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
      <header className="sticky top-0 z-50 py-4 px-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <a
            href="#faq"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            FAQ
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-8"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">
              El 73% de las apps filtran credenciales sensibles
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-title text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Tu app está filtrando{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              API keys
            </span>
            .
            <br />
            <span className="text-gray-400">Descúbrelo antes que un hacker.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
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
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Sin registro</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Resultados inmediatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>100% privado</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Provider logos */}
      <section className="relative z-10 px-4 py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <ProviderLogos />
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Stats />
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 py-20 bg-[#12121a]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cómo funciona</h2>
            <p className="text-gray-400 text-lg">
              De URL a reporte de seguridad en menos de un minuto
            </p>
          </motion.div>

          <Features />
        </div>
      </section>

      {/* What we detect */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Qué detectamos</h2>
            <p className="text-gray-400 text-lg">
              Un análisis completo de tu seguridad frontend
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'API Keys Expuestas',
                items: ['OpenAI, Anthropic', 'Stripe (live/test)', 'AWS, Firebase, Google', 'GitHub, Supabase, Vercel'],
                severity: 'critical',
              },
              {
                title: 'Archivos Sensibles',
                items: ['.env, .git', 'config.js, settings.json', 'credentials, secrets', 'database configs'],
                severity: 'high',
              },
              {
                title: 'Headers de Seguridad',
                items: ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'X-Content-Type-Options'],
                severity: 'medium',
              },
              {
                title: 'Otras Vulnerabilidades',
                items: ['Source maps expuestos', 'Mixed content', 'Protocolo HTTP', 'Tokens en URLs'],
                severity: 'low',
              },
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border ${
                  category.severity === 'critical'
                    ? 'bg-red-500/5 border-red-500/20'
                    : category.severity === 'high'
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : category.severity === 'medium'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <h3 className="font-semibold text-white mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item} className="text-sm text-gray-400 flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          category.severity === 'critical'
                            ? 'bg-red-400'
                            : category.severity === 'high'
                            ? 'bg-orange-400'
                            : category.severity === 'medium'
                            ? 'bg-yellow-400'
                            : 'bg-blue-400'
                        }`}
                      />
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
      <section className="relative z-10 px-4 py-20 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-cyan-400 shield-glow" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para proteger tu app?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              No esperes a que alguien descubra tus vulnerabilidades. Escanea ahora.
            </p>
            <a
              href="#top"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 btn-glow"
            >
              Escanear mi sitio gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-gray-400 text-lg">
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
