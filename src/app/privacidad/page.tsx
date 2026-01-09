'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold">Politica de Privacidad</h1>
          </div>

          <div className="prose prose-invert prose-gray max-w-none">
            <p className="text-gray-400 text-lg mb-8">
              Ultima actualizacion: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Informacion que recopilamos</h2>
              <p className="text-gray-300 mb-4">
                SecureScan recopila la siguiente informacion cuando utilizas nuestro servicio:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>URLs de los sitios web que escaneas</li>
                <li>Resultados del analisis de seguridad</li>
                <li>Informacion de pago procesada de forma segura por Stripe</li>
                <li>Direccion de correo electronico (si realizas una compra)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Como usamos tu informacion</h2>
              <p className="text-gray-300 mb-4">
                Utilizamos la informacion recopilada para:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Proporcionar el servicio de escaneo de seguridad</li>
                <li>Procesar pagos de forma segura</li>
                <li>Mejorar nuestro servicio y algoritmos de deteccion</li>
                <li>Comunicarnos contigo sobre tu compra</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. Seguridad de los datos</h2>
              <p className="text-gray-300">
                Implementamos medidas de seguridad tecnicas y organizativas para proteger tu informacion.
                Los pagos son procesados de forma segura por Stripe y nunca almacenamos datos de tarjetas
                de credito en nuestros servidores.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. Retencion de datos</h2>
              <p className="text-gray-300">
                Los resultados de los escaneos se almacenan durante 30 dias para que puedas acceder a ellos.
                Despues de este periodo, los datos son eliminados automaticamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Tus derechos</h2>
              <p className="text-gray-300 mb-4">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Acceder a tus datos personales</li>
                <li>Solicitar la eliminacion de tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
                <li>Solicitar la portabilidad de tus datos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Contacto</h2>
              <p className="text-gray-300">
                Si tienes preguntas sobre esta politica de privacidad, puedes contactarnos en:{' '}
                <a href="mailto:navarrojavi107@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                  navarrojavi107@gmail.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
