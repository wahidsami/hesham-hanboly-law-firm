import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck, RefreshCcw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { contentClient } from '../content/contentClient';
import { useLanguage } from '../contexts/LanguageContext';
import { formatSARAmount } from '../utils/formatSARAmount';

interface ConsultationPaymentResultPageProps {
  onBackToContact?: () => void;
  onBackToHome?: () => void;
}

type ResultState = 'verifying' | 'success' | 'failed' | 'error';

type VerificationSummary = {
  amountLabel: string;
  paymentMethod: string;
  confirmation: string;
  reference: string;
};

export default function ConsultationPaymentResultPage({
  onBackToContact,
  onBackToHome,
}: ConsultationPaymentResultPageProps) {
  const { direction, t, language } = useLanguage();
  const [state, setState] = useState<ResultState>('verifying');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [summary, setSummary] = useState<VerificationSummary | null>(null);

  const routeState = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      resourcePath: params.get('resourcePath') || '',
      checkoutId: params.get('checkoutId') || '',
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!routeState.resourcePath && !routeState.checkoutId) {
        if (!cancelled) {
          setState('error');
          setStatusMessage(t('بيانات العودة غير مكتملة.', 'Payment return data is incomplete.'));
        }
        return;
      }

      try {
        if (!cancelled) {
          setState('verifying');
          setStatusMessage(t('جارٍ التحقق من عملية الدفع بشكل آمن...', 'Verifying your payment securely...'));
        }

        const payload = routeState.resourcePath
          ? { resourcePath: routeState.resourcePath }
          : { resourcePath: `/v1/checkouts/${routeState.checkoutId}/payment` };

        const result = await contentClient.verifyConsultationPayment(payload);

        if (cancelled) return;

        if (result.state === 'paid') {
          setState('success');
          setStatusMessage(t('تمت عملية الدفع بنجاح.', 'Payment completed successfully.'));
          setSummary({
            amountLabel: formatSARAmount(result.paymentTransaction?.amount ?? 92.00, language),
            paymentMethod: result.paymentTransaction?.paymentBrand || result.consultation.paymentMethod || '—',
            confirmation: result.consultation.paymentStatus || 'paid',
            reference: result.paymentTransaction?.merchantTransactionId || result.consultation.voucherId || '—',
          });
          return;
        }

        if (result.state === 'pending') {
          setState('verifying');
          setStatusMessage(t('لا تزال عملية الدفع قيد المراجعة، الرجاء الانتظار قليلاً.', 'The payment is still being reviewed, please wait a moment.'));
          return;
        }

        setState('failed');
        setStatusMessage(t('تعذر إكمال عملية الدفع.', 'Payment could not be completed.'));
      } catch (error) {
        if (cancelled) return;
        setState('error');
        setStatusMessage(error instanceof Error && error.message ? error.message : t('تعذر التحقق من الدفع.', 'Unable to verify the payment.'));
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [routeState.resourcePath, routeState.checkoutId, t, language]);

  const icon =
    state === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
    state === 'failed' || state === 'error' ? <AlertTriangle className="w-6 h-6" /> :
    <Loader2 className="w-6 h-6 animate-spin" />;

  const accentClass =
    state === 'success'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : state === 'failed' || state === 'error'
        ? 'text-rose-700 bg-rose-50 border-rose-200'
        : 'text-[#A56A1E] bg-[#FFF8EC] border-[#E3C99A]';

  return (
    <div className="pt-24 bg-[#F1ECE3] min-h-screen text-[#121212]" style={{ direction }}>
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2rem] border border-[#D8D1C7] bg-[#FBF8F2] p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-[#A56A1E]">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              {t('التحقق من الدفع الآمن', 'Secure payment verification')}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black text-[#7A563D] font-serif">
              {state === 'success'
                ? t('تم تأكيد السداد بنجاح', 'Payment confirmed successfully')
                : state === 'failed'
                  ? t('فشلت عملية السداد', 'Payment verification failed')
                  : state === 'error'
                    ? t('حدث خطأ أثناء التحقق', 'Verification error')
                    : t('جارٍ التحقق من العملية', 'Verifying payment')}
            </h1>
            <p className="text-sm sm:text-base leading-7 text-[#4B4B4B] max-w-3xl">
              {state === 'verifying'
                ? t(
                    'نقوم الآن بمراجعة حالة الدفع من HyperPay مباشرةً من الخادم، مع التحقق من المبلغ ووسيلة الدفع وحالة الطلب.',
                    'We are now checking the payment status directly from HyperPay on the server, including amount, payment type, and request state.'
                  )
                : statusMessage}
            </p>
          </div>

          <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${accentClass}`}>
            {icon}
            <div className="text-sm font-semibold leading-6">
              {statusMessage || t('جارٍ التحضير...', 'Preparing verification...')}
            </div>
          </div>

          {state === 'success' && summary ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                  {t('المبلغ', 'Amount')}
                </div>
                <div className="text-base font-semibold text-[#121212]">{summary.amountLabel}</div>
              </div>
              <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                  {t('وسيلة الدفع', 'Payment method')}
                </div>
                <div className="text-base font-semibold text-[#121212]">{summary.paymentMethod}</div>
              </div>
              <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                  {t('المرجع', 'Reference')}
                </div>
                <div className="text-base font-semibold text-[#121212] break-all">{summary.reference}</div>
              </div>
              <div className="rounded-2xl bg-white border border-[#D8D1C7] p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#A56A1E] font-bold mb-2">
                  {t('الحالة', 'Confirmation')}
                </div>
                <div className="text-base font-semibold text-[#121212]">{summary.confirmation}</div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBackToContact}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1E1E] text-white hover:bg-black font-semibold text-sm transition-all"
            >
              <span>{t('العودة', 'Go back')}</span>
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#D8D1C7] text-[#5B5B5B] hover:text-[#1E1E1E] hover:bg-white font-semibold text-sm transition-all"
            >
              <span>{t('الرئيسية', 'Home')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
