import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  // Safari on iOS: has "Safari" in UA but NOT CriOS/FxiOS/EdgiOS etc.
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isSafari;
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function InstallBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall, deferredPrompt } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('install_banner_dismissed') === '1');

  if (isInstalled || dismissed) return null;

  const iosSafari = isIOSSafari();
  const android = isAndroid();

  // On iOS, only show in Safari
  if (isIOS && !iosSafari) return null;
  // If not iOS and not installable, don't show
  if (!isIOS && !isInstallable) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('install_banner_dismissed', '1');
  };

  return (
    <div className="sticky top-0 z-[100] bg-primary text-primary-foreground px-3 py-2.5 flex items-center gap-2 shadow-md text-sm" dir="ltr">
      <Download className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        {isIOS ? (
          <p className="leading-snug">
            Sur iPhone, utilisez <strong>Safari</strong> puis cliquez sur{' '}
            <Share className="inline h-3.5 w-3.5 -mt-0.5" />{' '}
            Partager → <strong>Sur l'écran d'accueil</strong> pour installer Ma Khatma.
          </p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {deferredPrompt ? (
              <>
                <span>Installez Ma Khatma pour un accès rapide</span>
                <button
                  onClick={promptInstall}
                  className="px-3 py-1 rounded-lg bg-accent text-accent-foreground font-semibold text-xs whitespace-nowrap transition-colors hover:opacity-90"
                >
                  Installer
                </button>
              </>
            ) : (
              <span>Menu ⋮ → Installer l'application</span>
            )}
          </div>
        )}
      </div>
      <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-white/20 shrink-0" aria-label="Fermer">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
