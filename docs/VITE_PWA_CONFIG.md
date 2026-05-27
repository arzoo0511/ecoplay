# PWA Configuration for Vite

If you're using `vite-plugin-pwa`, add this to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'EcoPlay: Interactive Environmental Platform',
        short_name: 'EcoPlay',
        description: 'A gamified platform for environmental study, community engagement, and eco-friendly challenges',
        theme_color: '#10b981',
        background_color: '#020617',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'icons/screenshot-540x720.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'icons/screenshot-1280x720.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          }
        ]
      }
    })
  ]
})
```

## Installation

If not already installed, add the plugin:

```bash
npm install -D vite-plugin-pwa
```

## Current Setup

The current `vite.config.ts` does not use `vite-plugin-pwa`. Instead, the app uses:
- Manual `manifest.json` in `public/`
- Meta tags in `index.html`
- Manual Service Worker registration

Both approaches work fine. The plugin is optional but provides additional optimizations like:
- Automatic service worker generation and updates
- Icon generation and optimization
- Workbox caching strategies
- Manifest injection

## Server MIME Type Configuration

Ensure your server serves the manifest with the correct MIME type:

### For Node.js/Express:
```javascript
app.use('/manifest.json', (req, res) => {
  res.type('application/manifest+json');
  res.sendFile('./public/manifest.json');
});
```

### For Vite Dev Server:
The dev server automatically handles this correctly.

### For Production (Vercel, Netlify, etc.):
These platforms automatically serve JSON files with the correct MIME type. No additional configuration needed.

## References

- [Vite PWA Plugin](https://vite-plugin-pwa.web.app/)
- [Workbox Configuration](https://developers.google.com/web/tools/workbox/modules/workbox-build)
