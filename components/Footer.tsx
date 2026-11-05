import React from 'react';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-metarh-dark text-white border-t border-white/10 mt-auto w-full shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <Logo variant="white" orientation="horizontal" className="h-7" />
          <span className="text-xs text-purple-200/80 border-l border-white/20 pl-3 hidden sm:inline">
            Recursos Humanos Estratégicos & Soluções Comerciais
          </span>
        </div>

        {/* Social Networks & Official Site */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <SocialLinks variant="footer" />
          <p className="text-[11px] text-gray-400 text-center md:text-right mt-1">
            METARH Recursos Humanos &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
