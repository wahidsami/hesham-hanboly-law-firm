import React from 'react';
import { Language } from '../types';

interface LogoProps {
  lang: Language;
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
  emblemSize?: string;
  logoUrl?: string;
  logoAlt?: string;
}

export default function Logo({
  lang,
  variant = 'light',
  showText = true,
  className = '',
  emblemSize = 'h-12 w-12',
  logoUrl,
  logoAlt,
}: LogoProps) {
  const resolvedLogoUrl = logoUrl || '/logo.webp';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative shrink-0 overflow-hidden ${emblemSize}`}>
        <img
          src={resolvedLogoUrl}
          alt={logoAlt || 'Hesham H. Hanboly International logo'}
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
    </div>
  );
}
