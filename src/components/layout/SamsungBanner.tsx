import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function isSamsungInternet(): boolean {
  if (typeof navigator === 'undefined') return false;
  var ua = navigator.userAgent || '';
  return /SamsungBrowser/i.test(ua);
}

export function SamsungBanner() {
  var [visible, setVisible] = useState(false);

  useEffect(function () {
    if (isSamsungInternet()) {
      var dismissed = localStorage.getItem('samsung_banner_dismissed');
      if (!dismissed) {
        setVisible(true);
      }
    }
  }, []);

  var handleDismiss = function () {
    setVisible(false);
    localStorage.setItem('samsung_banner_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mx-4 mt-4 flex items-start gap-3">
      <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
      <div className="flex-1">
        <p className="text-sm text-amber-800 font-medium">
          Pour une meilleure expérience, nous recommandons d'utiliser Google Chrome.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-amber-400 hover:text-amber-600 flex-shrink-0"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
