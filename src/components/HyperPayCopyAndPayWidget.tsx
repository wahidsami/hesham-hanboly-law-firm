import React, { useEffect, useMemo, useState } from 'react';

import './hyperpay-widget.css';

declare global {
  interface Window {
    wpwlOptions?: {
      locale?: string;
      paymentTarget?: string;
      numberFormatting?: boolean;
      style?: string;
      iframeStyles?: Record<string, string>;
    };
  }
}

interface HyperPayCopyAndPayWidgetProps {
  checkoutId: string;
  integrity: string;
  shopperResultUrl: string;
  locale: string;
  amountLabel: string;
  retryToken?: number;
}

export default function HyperPayCopyAndPayWidget({
  checkoutId,
  integrity,
  shopperResultUrl,
  locale,
  amountLabel,
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

    const isAr = locale === 'ar';

    window.wpwlOptions = {
      locale: isAr ? 'ar' : 'en',
      paymentTarget: '_top',
      numberFormatting: false,
      style: 'plain',
      labels: {
        submit: isAr ? `ادفع ${amountLabel}` : `Pay ${amountLabel}`
      },
      iframeStyles: {
        'padding': '0',
        'font-family': 'sans-serif',
        'font-size': '16px',
        'color': '#121212',
        'background-color': 'transparent',
        'border': 'none',
        'outline': 'none',
        'height': '48px', /* Matches the .wpwl-control height */
      },
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
  }, [checkoutId, integrity, locale, amountLabel, retryToken, scriptId, shopperResultUrl]);

  return (
    <div className="rounded-3xl border border-[#D8D1C7] bg-white/95 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A56A1E]">
            Secure Payment
          </div>
          <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" title={loaded ? 'Secure connection active' : 'Connecting...'} />
        </div>
        <div className="text-sm font-semibold text-[#121212]">
          HyperPay TEST
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
        className="paymentWidgets"
        data-brands="MADA VISA MASTER"
        key={`${checkoutId}-${retryToken}`}
      />
    </div>
  );
}
