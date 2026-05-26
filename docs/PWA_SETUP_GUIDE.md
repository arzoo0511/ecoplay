# PWA Setup Guide for EcoPlay

## Overview
This guide walks through setting up Progressive Web App (PWA) capabilities for EcoPlay, enabling users to install the app on iOS and Android devices with "Add to Home Screen" functionality.

## ✅ Completed Setup

### 1. **Web App Manifest** (`public/manifest.json`)
- ✅ App name and short name
- ✅ Description
- ✅ Theme colors (#10b981 - EcoPlay green)
- ✅ Display mode: `standalone`
- ✅ Orientation: `portrait-primary`
- ✅ Icon references (192x192, 512x512, maskable variants)
- ✅ App shortcuts for Dashboard and Learn
- ✅ Categories: education, lifestyle

### 2. **HTML Meta Tags** (`index.html`)
- ✅ Manifest link: `<link rel="manifest" href="/manifest.json">`
- ✅ Theme color: `<meta name="theme-color" content="#10b981">`
- ✅ Favicon configuration (192x192, 512x512)
- ✅ Apple mobile web app meta tags:
  - `apple-mobile-web-app-capable`: yes
  - `apple-mobile-web-app-status-bar-style`: black-translucent
  - `apple-mobile-web-app-title`: EcoPlay
  - `apple-touch-icon`: /icons/icon-192x192.png

### 3. **Service Worker** (`public/service-worker.ts`)
- ✅ Already implemented with caching strategies
- ✅ Network-first for API requests
- ✅ Cache-first for static assets
- ✅ Stale-while-revalidate for dynamic content

## 🎨 Icon Generation

### Generate Icons Locally

Run the Python script to generate placeholder icons:

```bash
python scripts/generate_icons.py
```

This creates 4 PNG files in `public/icons/`:
- `icon-192x192.png` - Small app icon
- `icon-512x512.png` - Large app icon (splash screen)
- `icon-192x192-maskable.png` - Adaptive icon (192px)
- `icon-512x512-maskable.png` - Adaptive icon (512px)

### Using Professional Icons

Replace the generated icons with professional designs:

1. **Create designs** with the EcoPlay green leaf logo (#10b981)
2. **Export as PNG** with transparent background
3. **Save to** `public/icons/` with the same filenames
4. **Dimensions**:
   - 192x192px @ 72 DPI
   - 512x512px @ 72 DPI

### Icon Design Tips

- **Background**: Use EcoPlay dark color (#020617) or green (#10b981)
- **Foreground**: Green leaf logo on dark background (or vice versa)
- **Safe Area**: Keep important elements within center 60% for maskable icons
- **Format**: PNG with transparency (RGBA)

## 📱 Testing Installation

### Android (Chrome)

1. Open EcoPlay in Chrome mobile
2. Tap menu (⋮) → **Install app** or **Add to Home Screen**
3. Confirm installation
4. App should appear on home screen with custom icon

**Requirements**:
- ✅ Manifest.json with proper MIME type
- ✅ Icons (192x192 minimum)
- ✅ HTTPS (or localhost for testing)
- ✅ Service Worker

### iOS (Safari 11.3+)

1. Open EcoPlay in Safari mobile
2. Tap Share (⬆️) → **Add to Home Screen**
3. Name the app and tap **Add**
4. App appears on home screen

**Requirements**:
- ✅ apple-mobile-web-app-capable meta tag
- ✅ apple-touch-icon
- ✅ HTTPS

## 🔍 Lighthouse PWA Audit

Run Lighthouse in Chrome DevTools:

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **PWA** category
4. Click **Analyze page load**

**Expected Results**:
- ✅ Installable
- ✅ Web app metadata
- ✅ Viewport configured
- ✅ Status bar color matches brand
- ✅ Themed address bar
- ✅ Icons sized correctly
- ✅ Splash screen

### Common Lighthouse Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Does not register a service worker" | Ensure `public/service-worker.ts` is registered in your app |
| "Web app manifest not found" | Check manifest link in `index.html` points to `/manifest.json` |
| "Icon size issues" | Verify icons are exactly 192x192 and 512x512 pixels |
| "Missing viewport meta tag" | Already present in `index.html` |
| "Not served over HTTPS" | Deploy to HTTPS (not needed for localhost testing) |

## 🚀 Deployment Checklist

Before going live:

- [ ] Generate production-quality icons (192x192, 512x512 PNG)
- [ ] Test on physical Android device (Chrome, Firefox, Samsung Internet)
- [ ] Test on physical iOS device (Safari)
- [ ] Verify app launches in standalone mode (no address bar)
- [ ] Test offline functionality with Service Worker
- [ ] Run Lighthouse PWA audit (target: 90+)
- [ ] Verify "Add to Home Screen" prompts appear
- [ ] Test app shortcuts (Dashboard, Learn)
- [ ] Verify theme colors display correctly
- [ ] Test on different screen sizes and orientations

## 📋 Implementation Tasks Summary

- [x] Create `public/manifest.json`
- [x] Add manifest link to `index.html`
- [x] Configure theme meta tags
- [x] Add Apple-specific meta tags
- [x] Add favicon configuration
- [x] Create icon generation script
- [ ] Generate production icons (manual design work)
- [ ] Test installability via Lighthouse
- [ ] Test on actual iOS Safari
- [ ] Test on actual Android Chrome

## 🔗 File References

| File | Purpose | Status |
|------|---------|--------|
| `public/manifest.json` | PWA configuration | ✅ Complete |
| `index.html` | PWA meta tags | ✅ Complete |
| `public/service-worker.ts` | Offline caching | ✅ Complete |
| `scripts/generate_icons.py` | Icon generation helper | ✅ Complete |
| `public/icons/` | App icon directory | 📝 Needs icons |

## 💡 Next Steps

1. **Generate Icons**: Run `python scripts/generate_icons.py` to create placeholder icons
2. **Professional Design**: Have a designer create high-quality icons (optional)
3. **Local Testing**: Test on Android emulator and iOS simulator
4. **Lighthouse Audit**: Run PWA audit and fix any issues
5. **Device Testing**: Test on real devices before release
6. **Deploy**: Push to production with all icons in place

## 📚 Resources

- [MDN Web Docs - Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Web.dev - Install a web app](https://web.dev/install/)
- [Apple - Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Google - Add a web app manifest](https://developers.google.com/web/fundamentals/web-app-manifest)
- [PWA Checklist](https://web.dev/pwa-checklist/)

## ⚠️ Important Notes

- **Manifest MIME Type**: Ensure your server serves `manifest.json` with `Content-Type: application/manifest+json`
- **HTTPS Required**: PWA features only work on HTTPS (except localhost)
- **Service Worker Scope**: Currently scoped to `/` - all app routes are covered
- **Caching Strategy**: Service Worker uses network-first for APIs and cache-first for assets
- **Icon Sizing**: PNG files must be exactly the specified dimensions (192x192, 512x512)

## 🎯 Acceptance Criteria Status

1. ✅ `manifest.json` is valid and served with correct MIME type
2. 📝 App icons are properly sized and referenced in manifest (pending icon generation)
3. 📝 Lighthouse PWA audit detects installable web app (pending icon files)
4. 📝 "Add to Home Screen" prompt appears on Chrome (Android) (pending icons)
5. 📝 App installs to home screen with custom icon (pending icons)
6. 📝 iOS Safari shows "Add to Home Screen" option (pending icons)
7. 📝 Installed app launches in standalone mode (pending icons)

---

**Last Updated**: 2026-05-26
**Status**: Ready for icon generation and testing
