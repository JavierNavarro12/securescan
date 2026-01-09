'use client';

import { motion } from 'framer-motion';

const providers = [
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'Stripe', color: '#635bff' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'Firebase', color: '#ffca28' },
  { name: 'GitHub', color: '#ffffff' },
  { name: 'Supabase', color: '#3fcf8e' },
  { name: 'Vercel', color: '#ffffff' },
  { name: 'Twilio', color: '#f22f46' },
];

export function ProviderLogos() {
  return (
    <div className="w-full">
      <p className="text-center text-gray-500 text-sm mb-6">
        Detectamos API keys de los principales proveedores
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
          >
            <span
              className="text-sm font-medium"
              style={{ color: provider.color }}
            >
              {provider.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
