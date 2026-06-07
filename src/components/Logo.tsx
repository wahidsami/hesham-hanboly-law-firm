import React from 'react';
import { Language } from '../types';

interface LogoProps {
  lang: Language;
  variant?: 'light' | 'dark'; // 'light' means light text for darkbg, 'dark' means dark text
  showText?: boolean;
  className?: string;
  emblemSize?: string; // e.g. 'h-12 w-12'
}

export default function Logo({ 
  lang, 
  variant = 'light', 
  showText = true, 
  className = '', 
  emblemSize = 'h-12 w-12' 
}: LogoProps) {
  
  // Color configuration based on dark vs light texts
  const textTitleColor = variant === 'light' ? 'text-white' : 'text-[#0F172A]';
  const textSubColor = variant === 'light' ? 'text-[#C8A96B]' : 'text-[#8C6F3D]';
  const textMutedColor = variant === 'light' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      
      {/* 1. TEXT SECTION (If RTL, we can render it before or let flex-row-reverse handle it) */}
      {showText && lang === 'ar' && (
        <div className="flex flex-col text-right">
          <span className={`font-bold transition-all duration-300 tracking-wide text-base sm:text-lg leading-tight ${textTitleColor}`}>
            شركة هشام حسن حنبلي الدولية
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-[0.05em] leading-normal ${textSubColor}`}>
            Hesham H Hanboly int'l Co.
          </span>
        </div>
      )}

      {showText && lang === 'en' && (
        <div className="flex flex-col text-left">
          <span className={`font-serif font-bold transition-all duration-300 tracking-wide text-base sm:text-lg ${textTitleColor}`}>
            Hesham H Hanboly int'l Co.
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-[0.05em] ${textSubColor}`}>
            شركة هشام حسن حنبلي الدولية
          </span>
        </div>
      )}

      {/* 2. THE EMBLEM STAMP */}
      <div className={`relative shrink-0 ${emblemSize}`}>
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definitions for Text Paths */}
          <defs>
            {/* Left Arc Path (for "Hesham") - counter clockwise or clockwise */}
            {/* Center: 100,100, radius: 80. Angle: 135 to 225 deg */}
            <path id="leftArc" d="M 43.4 43.4 A 80 80 0 0 0 43.4 156.6" fill="none" />
            
            {/* Top-Right Arc Path (for "H. Hanboly") */}
            {/* Angle: 225 to 337.5 deg approx */}
            <path id="topArc" d="M 43.4 43.4 A 80 80 0 0 1 173.9 69.4" fill="none" />
            
            {/* Bottom-Right Arc Path (for "Int'l Co.") */}
            {/* Angle: 337.5 to 135 deg approx */}
            <path id="bottomArc" d="M 173.9 69.4 A 80 80 0 0 1 43.4 156.6" fill="none" />
            
            {/* Radial background gradient */}
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EDE9DD" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Subtly colored globe/map circle inside */}
          <circle cx="100" cy="100" r="72" fill="url(#mapGlow)" />
          
          {/* Faint map structure details */}
          <circle cx="100" cy="100" r="72" fill="none" stroke="#C8A96B" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.3" />
          <path d="M 50 100 A 50 50 0 0 0 150 100 M 60 70 A 50 50 0 0 0 140 70 M 60 130 A 50 50 0 0 0 140 130" fill="none" stroke="#C8A96B" strokeWidth="0.4" opacity="0.2" />
          <path d="M 100 28 A 72 72 0 0 1 100 172 M 100 28 A 72 72 0 0 0 100 172" fill="none" stroke="#C8A96B" strokeWidth="0.4" opacity="0.25" />

          {/* 3 Color Outer Arc Bands */}
          {/* Left Band (Corporate Red) */}
          {/* Arc path from 135 deg to 225 deg */}
          <path 
            d="M 42.4 42.4 A 82 82 0 0 0 42.4 157.6 L 56.6 143.4 A 62 62 0 0 1 56.6 56.6 Z" 
            fill="#C21E2E" 
          />
          
          {/* Top/Right Band (Golden Yellow) */}
          {/* Arc path from 225 deg to 335 deg */}
          <path 
            d="M 42.4 42.4 A 82 82 0 0 1 175.7 67.5 L 157.4 75.1 A 62 62 0 0 0 56.6 56.6 Z" 
            fill="#F29E16" 
          />
          
          {/* Bottom/Right Band (Corporate Grey/Silver) */}
          {/* Arc path from 335 deg to 135 deg */}
          <path 
            d="M 175.7 67.5 A 82 82 0 0 1 42.4 157.6 L 56.6 143.4 A 62 62 0 0 0 157.4 75.1 Z" 
            fill="#9CA3AF" 
          />

          {/* Text Along Paths */}
          {/* 1. "Hesham" text in Red arc */}
          <text fontSize="14" fontWeight="bold" fill="#FFFFFF" fontFamily="Cairo, sans-serif">
            <textPath href="#leftArc" startOffset="50%" textAnchor="middle">
              Hesham
            </textPath>
          </text>

          {/* 2. "H. Hanboly" text in Gold/Orange arc */}
          <text fontSize="13" fontWeight="bold" fill="#FFFFFF" fontFamily="Cairo, sans-serif">
            <textPath href="#topArc" startOffset="50%" textAnchor="middle">
              H. Hanboly
            </textPath>
          </text>

          {/* 3. "Int'l Co." text in Grey arc */}
          <text fontSize="12" fontWeight="bold" fill="#FFFFFF" fontFamily="Cairo, sans-serif">
            <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
              Int'l Co.
            </textPath>
          </text>

          {/* Inner Golden border ring separating outer circle with inner */}
          <circle cx="100" cy="100" r="62" fill="none" stroke="#C8A96B" strokeWidth="1.5" opacity="0.6" />

          {/* Scale of Justice Graphic in center (Orange/Gold) */}
          <g transform="translate(100, 100) scale(1.1)" stroke="#ED8A19" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Main Center Pillar */}
            <line x1="0" y1="-32" x2="0" y2="28" />
            {/* Pillar Top knob */}
            <circle cx="0" cy="-35" r="3.5" fill="#ED8A19" stroke="none" />
            {/* Pillar Base levels */}
            <line x1="-12" y1="28" x2="12" y2="28" />
            <line x1="-18" y1="32" x2="18" y2="32" strokeWidth="4" />
            
            {/* Crossbeam */}
            <path d="M -26 -18 L 26 -18" strokeWidth="3.5" />
            {/* Crossbeam accents */}
            <circle cx="-26" cy="-18" r="1.5" fill="#ED8A19" />
            <circle cx="26" cy="-18" r="1.5" fill="#ED8A19" />

            {/* Left Hand Hanging Triangle & Bowl */}
            <line x1="-24" y1="-18" x2="-35" y2="8" strokeWidth="1.2" />
            <line x1="-24" y1="-18" x2="-13" y2="8" strokeWidth="1.2" stroke="#ED8A19" />
            <path d="M -37 8 C -37 18 -11 18 -11 8 Z" fill="#ED8A19" fillOpacity="0.2" strokeWidth="2.5" />

            {/* Right Hand Hanging Triangle & Bowl */}
            <line x1="24" y1="-18" x2="13" y2="8" strokeWidth="1.2" />
            <line x1="24" y1="-18" x2="35" y2="8" strokeWidth="1.2" stroke="#ED8A19" />
            <path d="M 11 8 C 11 18 37 18 37 8 Z" fill="#ED8A19" fillOpacity="0.2" strokeWidth="2.5" />
          </g>
        </svg>
      </div>
      
    </div>
  );
}
