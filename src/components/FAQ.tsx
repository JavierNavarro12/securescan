'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '¿Qué tipos de API keys detecta SecureScan?',
    answer:
      'Detectamos más de 40 tipos de API keys y credenciales incluyendo OpenAI, Anthropic, Stripe, AWS, MongoDB, PostgreSQL, MySQL, Redis, Firebase, Google Cloud, GitHub, Azure, Shopify, Cloudinary, PlanetScale, Supabase, Vercel, Twilio, SendGrid, Slack, Discord, Sentry, NPM, Mapbox y muchos más. También detectamos tokens JWT, cadenas de conexión a bases de datos y credenciales en URLs.',
  },
  {
    question: '¿El escaneo es seguro? ¿Guardan mis API keys?',
    answer:
      'La seguridad es nuestra prioridad. NO almacenamos las API keys encontradas en su forma completa. Solo guardamos una versión sanitizada (primeros y últimos caracteres) para mostrar en los reportes. Los escaneos son analizados en tiempo real y los datos sensibles nunca se persisten.',
  },
  {
    question: '¿Qué incluye el reporte gratuito vs el de pago?',
    answer:
      'El reporte gratuito te muestra tu puntuación de seguridad y el número de vulnerabilidades encontradas por severidad. El reporte de pago (€0.99) desbloquea: ubicación exacta de cada problema, los valores encontrados (sanitizados), guías paso a paso para solucionarlos y código de ejemplo.',
  },
  {
    question: '¿Cada cuánto debería escanear mi sitio?',
    answer:
      'Recomendamos escanear después de cada deploy a producción, especialmente si has añadido nuevas integraciones o cambiado variables de entorno. Los resultados se cachean por 1 hora, así que puedes escanear frecuentemente sin preocuparte.',
  },
  {
    question: '¿Funciona con cualquier sitio web?',
    answer:
      'SecureScan funciona con cualquier sitio web públicamente accesible. Analizamos el HTML, JavaScript bundles, y comprobamos archivos de configuración comunes. Para SPAs (React, Vue, etc.), analizamos los bundles de JavaScript donde a menudo se filtran keys.',
  },
  {
    question: '¿Qué pasa si encuentro una API key expuesta?',
    answer:
      '¡Actúa rápido! 1) Revoca la key inmediatamente en el servicio correspondiente. 2) Genera una nueva key. 3) Muévela a variables de entorno del servidor. 4) Despliega los cambios. 5) Monitorea el uso de la cuenta por si hubo acceso no autorizado.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
