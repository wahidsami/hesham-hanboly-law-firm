import React, { useMemo } from 'react';
import { ArrowLeft, ShieldCheck, RefreshCcw, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DoctorShieldPaymentResultPageProps {
  onBackToDoctorShield?: () => void;
  onBackToHome?: () => void;
}

const truncateValue = (value: string, size = 42) => {
  if (value.length <= size) {
    return value;
  }

  return `${value.slice(0, size)}…`;
};

export default function DoctorShieldPaymentResultPage({
  onBackToDoctorShield,
  onBackToHome,
}: DoctorShieldPaymentResultPageProps) {
  const { direction, t } = useLanguage();

  const routeState = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      requestId: params.get('requestId') || '',
      checkoutId: params.get('checkoutId') || '',
      resourcePath: params.get('resourcePath') || '',
    };
  }, []);

  return (
    <div className="pt-24 bg-[#F1ECE3] min-h-screen text-[#121212]" style={{ direction }}>
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2rem] border border-[#D8D1C7] bg-[#FBF8F2] p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-[#A56A1E]">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              {t('بوابة العودة الآمنة', 'Secure payment return')}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black text-[#7A563D] font-serif">
              {t('تم فتح مسار الدفع الآمن', 'Secure payment return route opened')}
            </h1>
            <p className="text-sm sm:text-base leading-7 text-[#4B4B4B] max-w-3xl">
              {t(
                'تم التقاط بيانات العودة من HyperPay بنجاح. نحتفظ بمعرّف الجلسة وresourcePath لمراجعة الخادم في المرحلة التالية، بدون عرض أي بيانات دفع حساسة هنا.',
                'HyperPay return metadata was captured successfully. We preserve the checkout and resourcePath details for server-side verification in the next phase, without exposing any sensitive payment data here.'
              )}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                Request
              </div>
              <div className="text-sm font-semibold text-[#121212] break-all">
                {routeState.requestId ? truncateValue(routeState.requestId, 48) : t('غير متوفر', 'Unavailable')}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                Checkout
              </div>
              <div className="text-sm font-semibold text-[#121212] break-all">
                {routeState.checkoutId ? truncateValue(routeState.checkoutId, 48) : t('غير متوفر', 'Unavailable')}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                resourcePath
              </div>
              <div className="text-sm font-semibold text-[#121212] break-all">
                {routeState.resourcePath ? truncateValue(routeState.resourcePath, 48) : t('غير متوفر', 'Unavailable')}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-white/80 p-5 text-sm leading-7 text-[#4B4B4B]">
            {t(
              'هذه الصفحة مجرد نقطة عودة آمنة لحفظ بيانات HyperPay الواردة. سنضيف التحقق النهائي من الخادم في المرحلة التالية، لذلك لا تظهر هنا أي حالة دفع نهائية بعد.',
              'This page is only a safe return point for preserving the HyperPay callback metadata. Final server-side verification will be added in the next phase, so no payment outcome is shown here yet.'
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBackToDoctorShield}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7A563D] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#946B4B]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('العودة إلى سند الطبيب', 'Back to Doctor Shield')}</span>
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D1C7] bg-white px-5 py-3 text-xs font-bold text-[#7A563D] transition-colors hover:bg-[#FBF8F2]"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>{t('العودة للرئيسية', 'Return Home')}</span>
            </button>
            <a
              href={window.location.pathname}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D1C7] bg-white px-5 py-3 text-xs font-bold text-[#7A563D] transition-colors hover:bg-[#FBF8F2]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('إعادة تحميل المسار', 'Reload route')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
