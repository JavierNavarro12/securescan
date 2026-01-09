'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import {
  Logo,
  ScanProgress,
  ScoreCircle,
  VulnerabilitySummary,
  VulnerabilityCard,
  PaywallCard,
  Footer,
} from '@/components';
import type { ScanResults, Vulnerability } from '@/types';

// Funcion para generar PDF
function generatePDF(results: ScanResults) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Titulo
  doc.setFontSize(24);
  doc.setTextColor(0, 150, 150);
  doc.text('SecureScan', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Reporte de Seguridad', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // URL y fecha
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`URL: ${results.url}`, 20, y);
  y += 6;
  doc.text(`Fecha: ${new Date(results.scannedAt).toLocaleDateString('es-ES')}`, 20, y);
  y += 15;

  // Score
  doc.setFontSize(18);
  doc.setTextColor(results.score >= 70 ? 34 : results.score >= 40 ? 234 : 239,
                   results.score >= 70 ? 197 : results.score >= 40 ? 179 : 68,
                   results.score >= 70 ? 94 : results.score >= 40 ? 8 : 68);
  doc.text(`Puntuacion: ${results.score}/100`, 20, y);
  y += 15;

  // Resumen
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`Vulnerabilidades encontradas: ${results.summary.total}`, 20, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`Criticas: ${results.summary.critical} | Altas: ${results.summary.high} | Medias: ${results.summary.medium} | Bajas: ${results.summary.low}`, 20, y);
  y += 15;

  // Linea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Vulnerabilidades
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Detalle de Vulnerabilidades', 20, y);
  y += 10;

  const severityLabels: Record<string, string> = {
    critical: 'CRITICO',
    high: 'ALTO',
    medium: 'MEDIO',
    low: 'BAJO'
  };

  results.vulnerabilities.forEach((vuln: Vulnerability, index: number) => {
    // Check si necesitamos nueva pagina
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Severidad y titulo
    doc.setFontSize(11);
    doc.setTextColor(
      vuln.severity === 'critical' ? 239 : vuln.severity === 'high' ? 249 : vuln.severity === 'medium' ? 234 : 59,
      vuln.severity === 'critical' ? 68 : vuln.severity === 'high' ? 115 : vuln.severity === 'medium' ? 179 : 130,
      vuln.severity === 'critical' ? 68 : vuln.severity === 'high' ? 22 : vuln.severity === 'medium' ? 8 : 246
    );
    doc.text(`[${severityLabels[vuln.severity]}]`, 20, y);

    doc.setTextColor(0, 0, 0);
    const titleLines = doc.splitTextToSize(vuln.title, pageWidth - 70);
    doc.text(titleLines, 50, y);
    y += titleLines.length * 5 + 3;

    // Descripcion
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(vuln.description, pageWidth - 45);
    doc.text(descLines, 25, y);
    y += descLines.length * 4 + 3;

    // Solucion
    doc.setFontSize(9);
    doc.setTextColor(0, 130, 130);
    doc.text('Como solucionarlo:', 25, y);
    y += 5;

    doc.setTextColor(60, 60, 60);
    vuln.remediation.steps.forEach((step: string, i: number) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, pageWidth - 50);
      doc.text(stepLines, 30, y);
      y += stepLines.length * 4 + 2;
    });

    y += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generado por SecureScan - securescan.dev', pageWidth / 2, 290, { align: 'center' });

  // Descargar
  const filename = `securescan-${results.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}.pdf`;
  doc.save(filename);
}

export default function ScanResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scanId = params.id as string;

  const [results, setResults] = useState<ScanResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(isSuccess);
  const [promptCopied, setPromptCopied] = useState(false);

  // Ocultar mensaje de exito despues de 4 segundos
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Generar prompt para IA
  const generateAIPrompt = (results: ScanResults): string => {
    const vulnList = results.vulnerabilities
      .map((v, i) => `${i + 1}. **${v.title}**: ${v.description}`)
      .join('\n');

    return `Necesito que me ayudes a solucionar las siguientes vulnerabilidades de seguridad encontradas en mi sitio web ${results.url}:

${vulnList}

Por favor:
1. Dame el codigo exacto o configuracion necesaria para solucionar cada vulnerabilidad
2. Si es un proyecto Next.js/Vercel, dame la configuracion para next.config.js o vercel.json
3. Si necesito modificar headers del servidor, dame ejemplos para diferentes plataformas (Vercel, Netlify, Apache, Nginx)
4. Explica brevemente por que cada solucion funciona

Mi stack tecnologico es: [COMPLETA CON TU STACK]`;
  };

  const copyPrompt = () => {
    if (results) {
      navigator.clipboard.writeText(generateAIPrompt(results));
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  };

  // Verify payment when returning from Stripe
  useEffect(() => {
    if (!scanId || !isSuccess || paymentVerified) return;

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId }),
        });
        const data = await response.json();
        if (data.success && data.isPaid) {
          setPaymentVerified(true);
          // Refresh results to get paid version
          const resultsResponse = await fetch(`/api/results/${scanId}`);
          const resultsData = await resultsResponse.json();
          if (resultsData.success) {
            setResults(resultsData.results);
          }
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
      }
    };

    verifyPayment();
  }, [scanId, isSuccess, paymentVerified]);

  // Poll for results
  useEffect(() => {
    if (!scanId) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results/${scanId}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Error al obtener resultados');
          setLoading(false);
          return;
        }

        setResults(data.results);

        // If still scanning, poll again
        if (data.results.status === 'pending' || data.results.status === 'scanning') {
          setTimeout(fetchResults, 2000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Error de conexión');
        setLoading(false);
      }
    };

    fetchResults();
  }, [scanId]);

  // Show scanning progress
  if (loading || results?.status === 'scanning' || results?.status === 'pending') {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 grid-bg pointer-events-none" />
        <div className="fixed inset-0 radial-gradient-center pointer-events-none" />

        <header className="sticky top-0 z-50 py-4 px-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>
        </header>

        <main className="relative z-10 px-4 py-16">
          <ScanProgress
            status={results?.status || 'scanning'}
            url={results?.url || 'Cargando...'}
          />
        </main>
      </div>
    );
  }

  // Show error
  if (error || results?.status === 'failed') {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 grid-bg pointer-events-none" />

        <header className="sticky top-0 z-50 py-4 px-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>
        </header>

        <main className="relative z-10 px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Error en el escaneo</h1>
            <p className="text-gray-400 mb-8">
              {error || 'No pudimos completar el escaneo. Por favor, inténtalo de nuevo.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 radial-gradient-top pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Nuevo escaneo
          </Link>
        </div>
      </header>

      {/* Payment status messages */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 bg-green-500/10 border-b border-green-500/20 px-4 py-3"
          >
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">
                ¡Pago completado! Ya puedes ver el reporte completo.
              </span>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {isCanceled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3"
        >
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400">
              Pago cancelado. Puedes desbloquearlo cuando quieras.
            </span>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <main className="relative z-10 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* URL info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="text-gray-400 text-sm mb-1">Resultados para</p>
            <h1
              className="text-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {results.url.replace(/^https?:\/\//, '')}
              <a
                href={results.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h1>
          </motion.div>

          {/* Score and summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Score circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center items-center p-8 bg-[#12121a] border border-white/5 rounded-2xl"
            >
              <ScoreCircle score={results.score} />
            </motion.div>

            {/* Vulnerability summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-[#12121a] border border-white/5 rounded-2xl"
            >
              <VulnerabilitySummary summary={results.summary} />
            </motion.div>
          </div>

          {/* Paywall or vulnerabilities list */}
          {!results.isPaid && results.summary.total > 0 ? (
            <div className="space-y-8">
              {/* Locked vulnerability preview - no details shown */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Vulnerabilidades encontradas
                </h2>

                {/* Blurred placeholder cards */}
                <div className="relative">
                  <div className="space-y-3 filter blur-sm pointer-events-none select-none">
                    {[...Array(Math.min(results.summary.total, 3))].map((_, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/10" />
                          <div className="flex-1">
                            <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                            <div className="h-6 w-64 bg-white/20 rounded mb-2" />
                            <div className="h-4 w-48 bg-white/10 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overlay message */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#12121a]/90 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/10 text-center">
                      <span className="text-2xl mb-2 block">🔒</span>
                      <p className="text-white font-medium">
                        {results.summary.total} vulnerabilidades detectadas
                      </p>
                      <p className="text-gray-400 text-sm mb-3">
                        Desbloquea para ver los detalles
                      </p>
                      <button
                        onClick={() => document.getElementById('paywall')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all"
                      >
                        Desbloquear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paywall */}
              <div id="paywall">
                <PaywallCard scanId={scanId} />
              </div>
            </div>
          ) : results.summary.total > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Vulnerabilidades encontradas
                </h2>
                <button
                  onClick={() => generatePDF(results)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
              </div>

              {results.vulnerabilities.map((vuln, index) => (
                <VulnerabilityCard
                  key={vuln.id}
                  vulnerability={vuln}
                  index={index}
                  isPaid={true}
                />
              ))}

              {/* AI Prompt Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Soluciona todo con IA</h3>
                    <p className="text-sm text-gray-400">Copia este prompt y pegalo en Claude o ChatGPT</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {generateAIPrompt(results)}
                  </pre>
                </div>

                <button
                  onClick={copyPrompt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all font-medium"
                >
                  {promptCopied ? (
                    <>
                      <Check className="w-5 h-5" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar prompt para IA
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-[#12121a] border border-white/5 rounded-2xl"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Excelente! No encontramos vulnerabilidades
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Tu sitio parece estar bien configurado. Recuerda escanear regularmente
                después de cada deploy.
              </p>
            </motion.div>
          )}

          {/* Scan again CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Escanear otro sitio
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
