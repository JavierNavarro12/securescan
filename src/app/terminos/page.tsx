'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
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
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold">Terminos y Condiciones</h1>
          </div>

          <div className="prose prose-invert prose-gray max-w-none">
            <p className="text-gray-400 text-lg mb-8">
              Ultima actualizacion: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Aceptacion de los terminos</h2>
              <p className="text-gray-300">
                Al utilizar SecureScan, aceptas estos terminos y condiciones en su totalidad.
                Si no estas de acuerdo con alguna parte de estos terminos, no debes utilizar nuestro servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Descripcion del servicio</h2>
              <p className="text-gray-300">
                SecureScan es un servicio de analisis de seguridad web que escanea sitios web en busca
                de vulnerabilidades comunes, claves API expuestas, cabeceras de seguridad faltantes
                y otros problemas de seguridad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. Uso permitido</h2>
              <p className="text-gray-300 mb-4">
                Solo puedes utilizar SecureScan para:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Escanear sitios web de tu propiedad</li>
                <li>Escanear sitios web para los que tengas autorizacion expresa</li>
                <li>Fines educativos y de investigacion de seguridad</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Queda prohibido utilizar el servicio para actividades maliciosas o ilegales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. Limitacion de responsabilidad</h2>
              <p className="text-gray-300">
                SecureScan se proporciona &quot;tal cual&quot; sin garantias de ningun tipo. No garantizamos
                que el escaneo detecte todas las vulnerabilidades existentes. El usuario es responsable
                de verificar los resultados y tomar las medidas de seguridad apropiadas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Pagos y reembolsos</h2>
              <p className="text-gray-300 mb-4">
                Los pagos se procesan de forma segura a traves de Stripe. Una vez realizado el pago
                y desbloqueado el reporte, no se realizaran reembolsos ya que el servicio ha sido
                completamente entregado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Propiedad intelectual</h2>
              <p className="text-gray-300">
                Todo el contenido, diseno y codigo de SecureScan es propiedad de sus creadores.
                No esta permitido copiar, modificar o distribuir el servicio sin autorizacion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Modificaciones</h2>
              <p className="text-gray-300">
                Nos reservamos el derecho de modificar estos terminos en cualquier momento.
                Los cambios entraran en vigor inmediatamente despues de su publicacion en el sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">8. Contacto</h2>
              <p className="text-gray-300">
                Si tienes preguntas sobre estos terminos, puedes contactarnos en:{' '}
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
