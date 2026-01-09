'use client';

import { useState } from 'react';
import { Search, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ScanInput() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Introduce una URL para escanear');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Error al iniciar el escaneo');
        setIsLoading(false);
        return;
      }

      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />

        {/* Input container */}
        <div className="relative flex items-center bg-[#12121a] border border-white/10 rounded-xl overflow-hidden group-hover:border-cyan-500/30 group-focus-within:border-cyan-500/50 transition-colors duration-300">
          {/* Search icon */}
          <div className="pl-5 pr-3">
            <Search className="w-5 h-5 text-gray-500" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="tuapp.vercel.app"
            disabled={isLoading}
            className="flex-1 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none font-medium text-lg disabled:opacity-50"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow m-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Escaneando...</span>
              </>
            ) : (
              <>
                <span>Escanear</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm fade-in-up">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      <p className="mt-4 text-center text-gray-500 text-sm">
        Introduce la URL de tu sitio web o aplicación
      </p>
    </form>
  );
}
