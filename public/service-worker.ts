/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v2';

const CACHE_NAMES = {
  static: `ecoplay-static-${CACHE_VERSION}`,
  api: `ecoplay-api-${CACHE_VERSION}`,
  swr: `ecoplay-swr-${CACHE_VERSION}`,
} as const;

const ACTIVE_CACHE_NAMES = new Set<string>(Object.values(CACHE_NAMES));

const STATIC_EXTENSIONS = [
  '.js',
  '.css',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.avif',
];

const LOG_PREFIX = '[EcoPlay SW]';

type Strategy = 'cache-first' | 'network-first' | 'stale-while-revalidate';

function log(strategy: Strategy, outcome: string, url: string): void {
  console.log(`${LOG_PREFIX} ${strategy} | ${outcome} | ${url}`);
}

function isSupabaseRequest(url: URL): boolean {
  return url.hostname.endsWith('.supabase.co');
}

function isStaticAsset(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  if (path.startsWith('/assets/')) return true;
  return STATIC_EXTENSIONS.some((ext) => path.endsWith(ext));
}

function isNavigationRequest(request: Request): boolean {
  return request.mode === 'navigate' || request.destination === 'document';
}

function isSecondaryAsset(url: URL, request: Request): boolean {
  if (request.method !== 'GET') return false;
  if (isSupabaseRequest(url) || isStaticAsset(url) || isNavigationRequest(request)) {
    return false;
  }
  return (
    request.destination === 'manifest' ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname === '/vite.svg'
  );
}

function shouldHandle(request: Request): boolean {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.origin !== self.location.origin && !isSupabaseRequest(url)) {
    return false;
  }
  return true;
}

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    log('cache-first', 'hit', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    log('cache-first', 'miss (network)', request.url);
    return response;
  } catch {
    log('cache-first', 'miss (offline)', request.url);
    return new Response('Offline — asset not cached', { status: 503 });
  }
}

async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    log('network-first', 'network', request.url);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      log('network-first', 'fallback (cache)', request.url);
      return cached;
    }
    log('network-first', 'miss (offline)', request.url);
    return new Response('Offline — API response not cached', { status: 503 });
  }
}

async function networkFirstNavigation(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAMES.swr);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      if (request.mode === 'navigate') {
        const shell = await caches.open(CACHE_NAMES.static);
        await shell.put('/index.html', response.clone());
      }
    }
    log('network-first', 'network (navigation)', request.url);
    return response;
  } catch {
    const cached =
      (await caches.match(request)) ||
      (await caches.match('/index.html')) ||
      (await caches.match('/'));
    if (cached) {
      log('network-first', 'fallback (app shell)', request.url);
      return cached;
    }
    log('network-first', 'miss (offline navigation)', request.url);
    return new Response('Offline — app shell not cached', { status: 503 });
  }
}

async function staleWhileRevalidate(
  request: Request,
  cacheName: string
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await caches.match(request);

  const revalidate = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      log('stale-while-revalidate', 'revalidated', request.url);
      return response;
    })
    .catch(() => null);

  if (cached) {
    log('stale-while-revalidate', 'hit (stale)', request.url);
    void revalidate;
    return cached;
  }

  const networkResponse = await revalidate;
  if (networkResponse) {
    log('stale-while-revalidate', 'network', request.url);
    return networkResponse;
  }

  log('stale-while-revalidate', 'miss (offline)', request.url);
  return new Response('Offline — resource not available', { status: 503 });
}

function pickStrategy(url: URL, request: Request): Strategy | 'navigation' | null {
  if (isSupabaseRequest(url)) return 'network-first';
  if (isNavigationRequest(request)) return 'navigation';
  if (isStaticAsset(url)) return 'cache-first';
  if (isSecondaryAsset(url, request)) return 'stale-while-revalidate';
  return null;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      console.log(`${LOG_PREFIX} install | v${CACHE_VERSION}`);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const deleted = await Promise.all(
        keys
          .filter((key) => !ACTIVE_CACHE_NAMES.has(key))
          .map(async (key) => {
            await caches.delete(key);
            return key;
          })
      );
      if (deleted.length > 0) {
        console.log(`${LOG_PREFIX} activate | removed stale caches: ${deleted.join(', ')}`);
      }
      await self.clients.claim();
      console.log(`${LOG_PREFIX} activate | claimed clients (v${CACHE_VERSION})`);
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!shouldHandle(request)) return;

  const url = new URL(request.url);
  const strategy = pickStrategy(url, request);
  if (!strategy) return;

  event.respondWith(
    (async () => {
      switch (strategy) {
        case 'navigation':
          return networkFirstNavigation(request);
        case 'cache-first':
          return cacheFirst(request, CACHE_NAMES.static);
        case 'network-first':
          return networkFirst(request, CACHE_NAMES.api);
        case 'stale-while-revalidate':
          return staleWhileRevalidate(request, CACHE_NAMES.swr);
      }
    })()
  );
});
