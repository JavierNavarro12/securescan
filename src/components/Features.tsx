'use client';

import { motion } from 'framer-motion';
import { Link2, Search, Shield, FileCheck } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Ingresa tu URL',
    description: 'Introduce la URL de tu sitio web o aplicación. Funciona con cualquier sitio público.',
    accent: 'emerald',
  },
  {
    icon: Search,
    title: 'Analizamos tu código',
    description: 'Escaneamos HTML, JavaScript bundles y archivos de configuración en busca de vulnerabilidades.',
    accent: 'emerald',
  },
  {
    icon: Shield,
    title: 'Recibe tu puntuación',
    description: 'Obtienes una puntuación de seguridad de 0-100 y un resumen de vulnerabilidades encontradas.',
    accent: 'emerald',
  },
  {
    icon: FileCheck,
    title: 'Desbloquea el detalle',
    description: 'Por solo €0.99, accede al reporte completo con guías paso a paso para solucionar cada problema.',
    accent: 'emerald',
  },
];

export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="relative group"
          >
            {/* Connector line (except last) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px">
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
