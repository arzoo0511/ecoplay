# Icon Generation Instructions

## Automatic Generation (Placeholder)

Run the Python script to generate placeholder icons:

```bash
python scripts/generate_icons.py
```

**Requirements:**
- Python 3.6+
- Pillow library: `pip install Pillow`

**Output:**
- `icon-192x192.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`

## Professional Icon Design

For production, use professional design tools:

### Using Figma
1. Create 512x512 artboard
2. Design green leaf on dark background
3. Export as PNG (transparent background)
4. Create maskable variant with safe area
5. Export all sizes

### Using Adobe Illustrator
1. Set up 512x512 canvas
2. Design icon with EcoPlay colors
3. Export for Web (PNG, transparent)
4. Scale for 192x192 version
5. Create maskable variants

### Using Sketch
1. Create 512x512 artboard
2. Design with EcoPlay brand colors
3. Export as PNG with transparency
4. Create multiple sizes
5. Generate maskable variants

### Using Online Tools
- [Pixlr](https://pixlr.com/) - Free online editor
- [Canva](https://www.canva.com/) - Design templates
- [Adobe Express](https://www.adobe.com/express/) - Free design tool
- [Gravit Designer](https://www.gravit.io/) - Free vector design

## Icon Optimization

After creating icons, optimize for web:

```bash
# Using ImageOptim (Mac)
open -a ImageOptim public/icons/*.png

# Using TinyPNG CLI
npm install -g tinypng-cli
tinypng public/icons/*.png

# Using ImageMagick
convert icon-512x512.png -strip -quality 85 icon-512x512.png
```

## Maskable Icon Guidelines

Android adaptive icons use a "mask" that clips icons into different shapes. Design guidelines:

1. **Safe Zone**: Keep important content within center 60% (192x192 → 115px circle)
2. **Extended Canvas**: Design can extend to edges for context
3. **Transparency**: Use full transparency for areas outside the important content
4. **Testing**: Use [Android Icon Generator](https://romannurik.github.io/AndroidAssetStudio/icons-adaptive.html)

### Safe Area Sizes
- 512x512: Safe zone diameter = 307px (center circle)
- 192x192: Safe zone diameter = 115px (center circle)

## Export Settings

### PNG Settings
- **Format**: PNG-24 (or PNG-32 for alpha channel)
- **Color Space**: sRGB
- **Compression**: Maximum
- **Interlacing**: Progressive (optional)
- **Metadata**: Remove all metadata

### Dimensions (Exact)
- Regular icons: 192×192px, 512×512px
- Maskable icons: Same dimensions, but design for safe area

## Quality Checklist

- [ ] Icon is recognizable at small sizes (32px)
- [ ] Colors match EcoPlay brand (#10b981, #020617)
- [ ] Transparent background (PNG RGBA)
- [ ] No anti-aliasing artifacts
- [ ] Works on both light and dark backgrounds
- [ ] Maskable variant has safe zone respected
- [ ] File size optimized (<100KB per icon)
- [ ] Tested on multiple device types

## File Naming

Follow exact naming convention for manifest.json to work correctly:

```
public/icons/
├── icon-192x192.png              # Regular 192×192
├── icon-512x512.png              # Regular 512×512
├── icon-192x192-maskable.png    # Maskable 192×192
└── icon-512x512-maskable.png    # Maskable 512×512
```

## Testing Your Icons

1. **Local Testing**:
   ```bash
   npm run dev
   # Open http://localhost:5173
   # Open DevTools → Lighthouse → PWA
   ```

2. **Lighthouse Audit**:
   - Check icon sizes are correct
   - Verify theme colors
   - Confirm maskable icons display properly

3. **Android Testing**:
   - Test on Android emulator
   - Use Chrome DevTools to inspect manifest
   - Create shortcut and verify icon

4. **iOS Testing**:
   - Test on iOS simulator
   - Safari: Share → Add to Home Screen
   - Verify apple-touch-icon appears

## Common Issues

| Issue | Solution |
|-------|----------|
| Icon appears blurry | Check dimensions are exact (192×192, 512×512) |
| Icon has white background | Ensure PNG has transparency (RGBA) |
| Maskable icon looks cut off | Move content to safe zone center 60% |
| Icon not showing on home screen | Verify manifest.json references correct path |
| Lighthouse error about icon size | Export with exact pixel dimensions |

## References

- [MDN - Web App Manifest Icons](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [Web.dev - Installable Apps](https://web.dev/install/)
- [Android Adaptive Icons Guide](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Icon Asset Generator](https://www.imgonline.com.ua/eng/)
- [Maskable Icon Validator](https://maskable.app/)
