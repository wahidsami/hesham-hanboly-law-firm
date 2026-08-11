import React, { useEffect, useMemo, useState } from 'react';

declare global {
  interface Window {
    wpwlOptions?: {
      locale?: string;
      paymentTarget?: string;
      numberFormatting?: boolean;
    };
  }
}

interface HyperPayCopyAndPayWidgetProps {
  checkoutId: string;
  integrity: string;
  shopperResultUrl: string;
  locale: string;
  retryToken?: number;
}

export default function HyperPayCopyAndPayWidget({
  checkoutId,
  integrity,
  shopperResultUrl,
  locale,
  retryToken = 0,
}: HyperPayCopyAndPayWidgetProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const scriptId = useMemo(() => 'hyperpay-copyandpay-widget', []);

  useEffect(() => {
    if (!checkoutId || !integrity) {
      return undefined;
    }

    setLoaded(false);
    setError('');

    window.wpwlOptions = {
      locale: locale === 'ar' ? 'ar' : 'en',
      paymentTarget: '_top',
      numberFormatting: false,
    };

    const previousScript = document.getElementById(scriptId);
    if (previousScript) {
      previousScript.remove();
    }

    const form = document.querySelector('form.paymentWidgets');
    if (form) {
      form.setAttribute('action', shopperResultUrl);
      form.setAttribute('data-brands', 'MADA VISA MASTER');
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${encodeURIComponent(checkoutId)}`;
    script.integrity = integrity;
    script.crossOrigin = 'anonymous';
    script.async = true;

    script.onload = () => {
      setLoaded(true);
    };

    script.onerror = () => {
      const message = 'Failed to load the secure HyperPay payment widget.';
      setError(message);
    };

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [checkoutId, integrity, locale, retryToken, scriptId, shopperResultUrl]);

  return (
    <div className="rounded-3xl border border-[#D8D1C7] bg-white/95 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A56A1E]">
            Secure COPYandPAY
          </div>
          <div className="text-sm font-semibold text-[#121212]">
            HyperPay TEST payment widget
          </div>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A563D]">
          {loaded ? 'Widget ready' : 'Loading secure payment...'}
        </div>
      </div>

      {!loaded && !error && (
        <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FBF8F2] px-4 py-5 text-sm text-[#5B5B5B]">
          Loading secure payment...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        action={shopperResultUrl}
        className="paymentWidgets min-h-[260px]"
        data-brands="MADA VISA MASTER"
        key={`${checkoutId}-${retryToken}`}
      />
    </div>
  );
}
