'use client';

import { Logo } from './Logo';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Logo size="sm" />

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="/privacidad" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="/terminos" className="hover:text-white transition-colors">
              Términos
            </a>
            <a href="mailto:navarrojavi107@gmail.com" className="hover:text-white transition-colors">
              Contacto
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SecureScan. Todos los derechos reservados.</p>
          <p className="mt-2">
            Hecho con 🛡️ para proteger tu código
          </p>
        </div>
      </div>
    </footer>
  );
}
