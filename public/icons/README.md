# EcoPlay PWA Icons

This directory contains the app icons for the EcoPlay Progressive Web App.

## Required Icons

1. **icon-192x192.png** - Standard app icon (192x192px)
   - Used on home screen and app launcher
   - Standard PNG format with transparent background

2. **icon-512x512.png** - Large app icon (512x512px)
   - Used for splash screens on high-density displays
   - Standard PNG format with transparent background

3. **icon-192x192-maskable.png** - Maskable icon (192x192px)
   - Adaptive icon for newer Android devices
   - Safe content must be within center 60%
   - PNG format with transparent background

4. **icon-512x512-maskable.png** - Maskable icon (512x512px)
   - Adaptive icon for larger displays
   - Safe content must be within center 60%
   - PNG format with transparent background

## Design Guidelines

### Brand Colors
- **Primary (Accent)**: #10b981 (EcoPlay Green)
- **Dark Background**: #020617 (EcoPlay Dark)
- **White**: #FFFFFF

### Design Tips
- Feature the green leaf logo
- Ensure high contrast for visibility on home screen
- Use simple, recognizable design that scales well
- Include padding around edges for maskable variants
- Test on both light and dark backgrounds

## Icon Generation

To generate placeholder icons automatically:

```bash
python scripts/generate_icons.py
```

This creates all required icons with EcoPlay brand colors. Replace with professional designs as needed.

## Specs

| Icon | Size | Format | Transparency | Usage |
|------|------|--------|--------------|-------|
| icon-192x192.png | 192x192px | PNG | Yes (RGBA) | Home screen, app launcher |
| icon-512x512.png | 512x512px | PNG | Yes (RGBA) | Splash screens, large displays |
| icon-192x192-maskable.png | 192x192px | PNG | Yes (RGBA) | Adaptive icons (Android) |
| icon-512x512-maskable.png | 512x512px | PNG | Yes (RGBA) | Adaptive icons (Android) |

## Testing

After adding icons:

1. Build the app: `npm run build`
2. Test with Lighthouse PWA audit
3. Test on Android emulator (Chrome)
4. Test on iOS simulator (Safari)
5. Test on physical devices

## References

- [MDN - Web App Icons](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [Web.dev - Install a web app](https://web.dev/install/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
