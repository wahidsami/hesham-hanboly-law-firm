import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BillingAddressNotice() {
  const { language, direction } = useLanguage();

  return (
    <div 
      className={`mb-6 p-4 rounded-xl border border-[#A56A1E]/30 bg-[#A56A1E]/5 flex items-start gap-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
      dir={direction}
    >
      <div className="shrink-0 mt-0.5">
        <Info className="w-5 h-5 text-[#A56A1E]" />
      </div>
      
      <div className="flex-1 space-y-1.5">
        <h4 className="font-bold text-[#7A563D] tracking-tight text-sm uppercase">
          {language === 'ar' 
            ? 'مهم — استخدم الأحرف والأرقام الإنجليزية فقط'
            : 'IMPORTANT — ENGLISH LETTERS AND NUMBERS ONLY'}
        </h4>
        <div className="text-sm text-[#5B5B5B] leading-relaxed space-y-1">
          <p>
            {language === 'ar'
              ? 'يرجى إدخال عنوان الدفع باستخدام الأحرف والأرقام الإنجليزية فقط.'
              : 'Please enter your billing address using English/Latin letters and numbers only.'}
          </p>
          <p>
            {language === 'ar'
              ? 'لا يمكن قبول الأحرف العربية في عنوان الدفع لضمان معالجة البطاقة بنجاح.'
              : 'Arabic characters are not accepted for payment processing.'}
          </p>
        </div>
      </div>
    </div>
  );
}
