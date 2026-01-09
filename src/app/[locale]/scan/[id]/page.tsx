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
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { jsPDF } from 'jspdf';
import {
  Logo,
  ScanProgress,
  ScoreCircle,
  VulnerabilitySummary,
  VulnerabilityCard,
  PaywallCard,
  Footer,
  LanguageSelector,
} from '@/components';
import type { ScanResults, Vulnerability } from '@/types';

export default function ScanResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scanId = params.id as string;
  const t = useTranslations();

  const [results, setResults] = useState<ScanResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompletingAnimation, setShowCompletingAnimation] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(isSuccess);
  const [promptCopied, setPromptCopied] = useState(false);

  // Generate PDF
  function generatePDF(results: ScanResults) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(24);
    doc.setTextColor(0, 150, 150);
    doc.text('SecureScan', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(t('results.title'), pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`URL: ${results.url}`, 20, y);
    y += 6;
    doc.text(`${new Date(results.scannedAt).toLocaleDateString()}`, 20, y);
    y += 15;

    doc.setFontSize(18);
    doc.setTextColor(results.score >= 70 ? 34 : results.score >= 40 ? 234 : 239,
                     results.score >= 70 ? 197 : results.score >= 40 ? 179 : 68,
                     results.score >= 70 ? 94 : results.score >= 40 ? 8 : 68);
    doc.text(`${results.score}/100`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`${t('results.vulnerabilities')}: ${results.summary.total}`, 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`${t('results.severity.critical')}: ${results.summary.critical} | ${t('results.severity.high')}: ${results.summary.high} | ${t('results.severity.medium')}: ${results.summary.medium} | ${t('results.severity.low')}: ${results.summary.low}`, 20, y);
    y += 15;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(t('results.vulnerabilities'), 20, y);
    y += 10;

    results.vulnerabilities.forEach((vuln: Vulnerability) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(
        vuln.severity === 'critical' ? 239 : vuln.severity === 'high' ? 249 : vuln.severity === 'medium' ? 234 : 59,
        vuln.severity === 'critical' ? 68 : vuln.severity === 'high' ? 115 : vuln.severity === 'medium' ? 179 : 130,
        vuln.severity === 'critical' ? 68 : vuln.severity === 'high' ? 22 : vuln.severity === 'medium' ? 8 : 246
      );
      doc.text(`[${t(`results.labels.${vuln.severity}`)}]`, 20, y);

      doc.setTextColor(0, 0, 0);
      const titleLines = doc.splitTextToSize(vuln.title, pageWidth - 70);
      doc.text(titleLines, 50, y);
      y += titleLines.length * 5 + 3;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const descLines = doc.splitTextToSize(vuln.description, pageWidth - 45);
      doc.text(descLines, 25, y);
      y += descLines.length * 4 + 3;

      doc.setFontSize(9);
      doc.setTextColor(0, 130, 130);
      doc.text(t('results.vulnerability.howToFix') + ':', 25, y);
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

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('SecureScan - securescan.dev', pageWidth / 2, 290, { align: 'center' });

    const filename = `securescan-${results.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}.pdf`;
    doc.save(filename);
  }

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const generateAIPrompt = (results: ScanResults): string => {
    const vulnList = results.vulnerabilities
      .map((v, i) => `${i + 1}. [${t(`results.labels.${v.severity}`)}] ${v.title}\n   ${v.description}`)
      .join('\n\n');

    const criticalCount = results.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = results.vulnerabilities.filter(v => v.severity === 'high').length;

    return `${t('results.ai.promptHeader', { url: results.url })}
${t('results.ai.promptScore', { score: results.score })}
${t('results.ai.promptVulns', { total: results.vulnerabilities.length, critical: criticalCount, high: highCount })}

${t('results.ai.promptDetected')}

${vulnList}

${t('results.ai.promptNeed')}

${t('results.ai.promptNeed1')}
${t('results.ai.promptNeed2')}
${t('results.ai.promptNeed3')}

${t('results.ai.promptPriority')}`;
  };

  const copyPrompt = () => {
    if (results) {
      navigator.clipboard.writeText(generateAIPrompt(results));
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  };

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
          const resultsResponse = await fetch(`/api/results/${scanId}`);
          const resultsData = await resultsResponse.json();
          if (resultsData.success) {
            setResults(resultsData.results);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
      }
    };

    verifyPayment();
  }, [scanId, isSuccess, paymentVerified]);

  useEffect(() => {
    if (!scanId) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results/${scanId}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || t('scan.error.scanError'));
          setLoading(false);
          return;
        }

        setResults(data.results);

        if (data.results.status === 'pending' || data.results.status === 'scanning') {
          setTimeout(fetchResults, 2000);
        } else {
          setShowCompletingAnimation(true);
          setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      } catch (err) {
        setError(t('scan.error.connectionError'));
        setLoading(false);
      }
    };

    fetchResults();
  }, [scanId, t]);

  // Show scanning progress
  if (!isSuccess && (loading || results?.status === 'scanning' || results?.status === 'pending')) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 grid-bg pointer-events-none" />
        <div className="fixed inset-0 radial-gradient-center pointer-events-none" />

        <header className="sticky top-0 z-50 py-4 px-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <LanguageSelector />
          </div>
        </header>

        <main className="relative z-10 px-4 py-16">
          <ScanProgress
            status={results?.status || 'scanning'}
            url={results?.url || t('common.loading')}
            isCompleting={showCompletingAnimation}
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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <LanguageSelector />
          </div>
        </header>

        <main className="relative z-10 px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">{t('common.error')}</h1>
            <p className="text-gray-400 mb-8">
              {error || t('scan.error.scanError')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('common.scanAnother')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state when returning from payment
  if (!results || (isSuccess && loading)) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 grid-bg pointer-events-none" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('nav.newScan')}
            </Link>
            <LanguageSelector />
          </div>
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
                {t('common.success')}
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
              {t('common.cancel')}
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
            <p className="text-gray-400 text-sm mb-1">{t('results.title')}</p>
            <h1
              className="text-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {results.url.replace(/^https?:\/\//, '')}
              <a
                href={results.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-emerald-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h1>
          </motion.div>

          {/* Score and summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center items-center p-8 bg-[#12121a] border border-white/5 rounded-2xl"
            >
              <ScoreCircle score={results.score} />
            </motion.div>

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
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  {t('results.vulnerabilities')}
                </h2>

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

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#12121a]/90 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/10 text-center">
                      <span className="text-2xl mb-2 block">🔒</span>
                      <p className="text-white font-medium">
                        {t('results.problemsFound', { count: results.summary.total })}
                      </p>
                      <p className="text-gray-400 text-sm mb-3">
                        {t('results.blurred.unlockToSee')}
                      </p>
                      <button
                        onClick={() => {
                          const element = document.getElementById('paywall');
                          if (element) {
                            const headerOffset = 80;
                            const elementPosition = element.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.scrollY - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-400 transition-all"
                      >
                        {t('common.unlock')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div id="paywall">
                <PaywallCard scanId={scanId} />
              </div>
            </div>
          ) : results.summary.total > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {t('results.vulnerabilities')}
                </h2>
                <button
                  onClick={() => generatePDF(results)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  {t('results.downloadPdf')}
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
                className="mt-8 p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('results.ai.title')}</h3>
                    <p className="text-sm text-gray-400">{t('results.ai.subtitle')}</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {generateAIPrompt(results)}
                  </pre>
                </div>

                <button
                  onClick={copyPrompt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-all font-medium"
                >
                  {promptCopied ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t('common.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      {t('results.ai.copyButton')}
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
                {t('results.scoreExcellent')}!
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                {t('results.noProblems')}
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
              className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.scanAnother')}
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
