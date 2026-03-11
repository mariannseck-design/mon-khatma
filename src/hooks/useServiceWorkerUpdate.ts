import { useEffect } from 'react';

async function clearAllCaches() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch (e) {
    // silently fail
  }
}

async function forceUpdate() {
  await clearAllCaches();
  // Unregister SW so it doesn't re-serve stale files on reload
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }
}

async function checkVersion(): Promise<boolean> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return false;
    const { v } = await res.json();
    const stored = localStorage.getItem('app_version');
    if (stored && stored !== v) {
      localStorage.setItem('app_version', v);
      await forceUpdate();
      return true; // needs reload
    }
    if (!stored) {
      localStorage.setItem('app_version', v);
    }
    return false;
  } catch {
    return false;
  }
}

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    const reload = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    // 1. Version check on mount
    checkVersion().then(needsReload => {
      if (needsReload) reload();
    });

    // 2. SW update logic — attach listeners once
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;

      // If a SW is already waiting, activate it
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Listen for new SW installations
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW installed and old one exists — skip waiting
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // Periodically check for SW updates (every 2 min)
      const interval = setInterval(() => {
        reg.update().catch(() => {});
        checkVersion().then(needsReload => {
          if (needsReload) reload();
        });
      }, 2 * 60 * 1000);

      // Cleanup interval on unmount (handled below)
      (window as any).__swUpdateInterval = interval;
    });

    // 3. Reload once when controller changes
    navigator.serviceWorker.addEventListener('controllerchange', reload);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', reload);
      const interval = (window as any).__swUpdateInterval;
      if (interval) clearInterval(interval);
    };
  }, []);
}
