const SW_URL = '/service-worker.js';
const LOG_PREFIX = '[EcoPlay SW Registration]';

function log(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.log(`${LOG_PREFIX} ${message}`, detail);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

function logError(message: string, error: unknown): void {
  console.error(`${LOG_PREFIX} ${message}`, error);
}

function shouldRegister(): boolean {
  if (!('serviceWorker' in navigator)) return false;
  return import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === 'true';
}

async function activateWaitingWorker(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (!shouldRegister()) {
    log('skipped (set VITE_ENABLE_SW=true to enable in development)');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: '/',
      updateViaCache: 'none',
    });

    log('registered', { scope: registration.scope });

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state !== 'installed') return;

        if (navigator.serviceWorker.controller) {
          log('update available — activating new worker');
          void activateWaitingWorker(registration);
        } else {
          log('installed for the first time');
        }
      });
    });

    if (registration.waiting) {
      await activateWaitingWorker(registration);
    }

    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      log('controller changed — reloading for fresh assets');
      window.location.reload();
    });

    await navigator.serviceWorker.ready;
    log('ready');
  } catch (error) {
    logError('registration failed', error);
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;

  const unregistered = await registration.unregister();
  if (unregistered) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    log('unregistered and cleared caches');
  }
  return unregistered;
}
