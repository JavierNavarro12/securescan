'use client';

import { motion } from 'framer-motion';
import { Link2, Search, Shield, FileCheck } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Ingresa tu URL',
    description: 'Introduce la URL de tu sitio web o aplicación. Funciona con cualquier sitio público.',
    color: '#00d4ff',
  },
  {
    icon: Search,
    title: 'Analizamos tu código',
    description: 'Escaneamos HTML, JavaScript bundles y archivos de configuración en busca de vulnerabilidades.',
    color: '#3b82f6',
  },
  {
    icon: Shield,
    title: 'Recibe tu puntuación',
    description: 'Obtienes una puntuación de seguridad de 0-100 y un resumen de vulnerabilidades encontradas.',
    color: '#8b5cf6',
  },
  {
    icon: FileCheck,
    title: 'Desbloquea el detalle',
    description: 'Por solo €0.99, accede al reporte completo con guías paso a paso para solucionar cada problema.',
    color: '#ec4899',
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
              <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent" />
            )}

            <div className="relative p-6 bg-[#12121a] border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 card-hover">
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#0a0a0f] border border-white/10 rounded-lg flex items-center justify-center">
                <span
                  className="text-sm font-bold"
                  style={{ color: step.color }}
                >
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${step.color}15` }}
              >
                <Icon className="w-7 h-7" style={{ color: step.color }} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
