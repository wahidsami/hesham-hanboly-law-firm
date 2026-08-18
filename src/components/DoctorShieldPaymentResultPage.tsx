import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck, RefreshCcw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { contentClient } from '../content/contentClient';
import { useLanguage } from '../contexts/LanguageContext';

interface DoctorShieldPaymentResultPageProps {
  onBackToDoctorShield?: () => void;
  onBackToHome?: () => void;
}

type ResultState = 'verifying' | 'success' | 'failed' | 'error';

type VerificationSummary = {
  amountLabel: string;
  paymentMethod: string;
  confirmation: string;
  reference: string;
};

export default function DoctorShieldPaymentResultPage({
  onBackToDoctorShield,
  onBackToHome,
}: DoctorShieldPaymentResultPageProps) {
  const { direction, t } = useLanguage();
  const [state, setState] = useState<ResultState>('verifying');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [summary, setSummary] = useState<VerificationSummary | null>(null);

  const routeState = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      resourcePath: params.get('resourcePath') || '',
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!routeState.resourcePath) {
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

        const result = await contentClient.verifyDoctorShieldPayment({
          resourcePath: routeState.resourcePath,
        });

        if (cancelled) return;

        if (result.state === 'paid') {
          setState('success');
          setStatusMessage(t('تمت عملية الدفع بنجاح.', 'Payment completed successfully.'));
          const verificationSummary = result.verificationSummary;
          setSummary({
            amountLabel: `${verificationSummary?.amount ?? result.paymentTransaction?.amount ?? 0} ${verificationSummary?.currency ?? 'SAR'}`,
            paymentMethod: verificationSummary?.paymentBrand || result.doctorShieldRequest.paymentMethod || result.doctorShieldRequest.cardBrand || '—',
            confirmation: verificationSummary?.paymentStatus || result.doctorShieldRequest.paymentStatus || 'paid',
            reference: verificationSummary?.merchantTransactionId || result.doctorShieldRequest.voucherId || result.paymentTransaction?.merchantTransactionId || '—',
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
  }, [routeState.resourcePath, t]);

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

          <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-white/80 p-5 text-sm leading-7 text-[#4B4B4B]">
            {state === 'success'
              ? t(
                  'تم اعتماد عملية الدفع وحفظها في السجل. يمكنك العودة إلى لوحة الطلب أو الصفحة الرئيسية في أي وقت.',
                  'The payment has been approved and stored in the records. You can return to the request page or the homepage at any time.'
                )
              : state === 'failed'
                ? t(
                    'لم نتمكن من اعتماد الدفع. إذا تم خصم أي مبلغ أو ظهرت لديك مشكلة، يرجى التواصل مع الفريق لمراجعة الحالة.',
                    'We could not approve the payment. If any amount was charged or you need help, please contact the team for review.'
                  )
                : state === 'error'
                  ? t(
                      'تعذر إكمال التحقق تلقائياً. الرجاء المحاولة مرة أخرى أو التواصل مع الدعم مع رقم الطلب فقط.',
                      'Automatic verification could not be completed. Please try again or contact support with the request number only.'
                    )
                  : t(
                      'سيبقى هذا المسار آمناً ومختصراً دون إظهار تفاصيل الدفع التقنية في الواجهة.',
                      'This route remains safe and minimal without exposing technical payment details in the interface.'
                    )}
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
          </div>
        </div>
      </section>
    </div>
  );
}
