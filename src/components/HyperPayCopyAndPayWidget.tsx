import React, { useEffect, useMemo, useRef, useState } from 'react';

import './hyperpay-widget.css';

declare global {
  interface Window {
    wpwlOptions?: {
      locale?: string;
      paymentTarget?: string;
      numberFormatting?: boolean;
      style?: string;
      labels?: Record<string, string>;
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptId = useMemo(() => 'hyperpay-copyandpay-widget', []);

  // Use refs to access latest locale/amountLabel without triggering effect reload
  const localeRef = useRef(locale);
  const amountLabelRef = useRef(amountLabel);
  useEffect(() => {
    localeRef.current = locale;
    amountLabelRef.current = amountLabel;
  }, [locale, amountLabel]);

  useEffect(() => {
    if (!checkoutId || !integrity || !containerRef.current) {
      return undefined;
    }

    setLoaded(false);
    setError('');

    const currentLocale = localeRef.current;
    const currentAmountLabel = amountLabelRef.current;
    const isAr = currentLocale === 'ar';

    window.wpwlOptions = {
      locale: isAr ? 'ar' : 'en',
      paymentTarget: '_top',
      numberFormatting: false,
      style: 'plain',
      labels: {
        submit: isAr ? `ادفع ${currentAmountLabel}` : `Pay ${currentAmountLabel}`
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

    // Obtain the container and ensure it is empty
    const container = containerRef.current;
    container.innerHTML = '';

    // Create the HyperPay form manually using vanilla DOM APIs
    const form = document.createElement('form');
    form.className = 'paymentWidgets';
    form.action = shopperResultUrl;
    form.setAttribute('data-brands', 'MADA VISA MASTER');
    
    // Append the manually-created form to the container
    container.appendChild(form);

    const previousScript = document.getElementById(scriptId);
    if (previousScript) {
      previousScript.remove();
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
      const currentScript = document.getElementById(scriptId);
      if (currentScript === script) {
        currentScript.remove();
      }
      // Safely clean up the vanilla DOM
      container.innerHTML = '';
      delete window.wpwlOptions;
    };
  }, [checkoutId, integrity, retryToken, shopperResultUrl, scriptId]);

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

      {/* 
        React strictly owns this container DIV. 
        HyperPay generated DOM lives inside it. 
        React will never attempt to reconcile the children of this DIV.
      */}
      <div ref={containerRef} />
    </div>
  );
}
