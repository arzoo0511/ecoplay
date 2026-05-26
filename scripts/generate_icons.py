#!/usr/bin/env python3
"""
Icon Generation Script for EcoPlay PWA
This script generates app icons in required sizes (192x192 and 512x512 PNG).

Requirements:
- Pillow: pip install Pillow

Usage:
    python generate_icons.py <path_to_source_image>

Example:
    python generate_icons.py logo.png
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def generate_ecoplay_icon(size: int, output_path: str, maskable: bool = False):
    """
    Generate EcoPlay icon with green leaf and brand colors.
    
    Args:
        size: Icon size (192 or 512)
        output_path: Path to save the icon
        maskable: Whether to create a maskable icon (with safe area)
    """
    # EcoPlay brand colors
    background_color = (2, 6, 23)  # #020617
    accent_color = (16, 185, 129)  # #10b981
    white = (255, 255, 255)
    
    # Create image
    img = Image.new('RGBA', (size, size), background_color + (255,))
    draw = ImageDraw.Draw(img)
    
    if maskable:
        # For maskable icons, use a smaller center area for safe display
        safe_margin = int(size * 0.15)
    else:
        safe_margin = int(size * 0.1)
    
    # Draw green circle background
    circle_radius = size // 2 - safe_margin
    circle_x = size // 2 - circle_radius
    circle_y = size // 2 - circle_radius
    draw.ellipse(
        [circle_x, circle_y, circle_x + circle_radius * 2, circle_y + circle_radius * 2],
        fill=accent_color + (255,)
    )
    
    # Draw leaf shape (simplified)
    center_x = size // 2
    center_y = size // 2
    leaf_width = int(circle_radius * 0.6)
    leaf_height = int(circle_radius * 0.8)
    
    # Create leaf points
    leaf_points = [
        (center_x, center_y - leaf_height),  # top
        (center_x + leaf_width, center_y),   # right
        (center_x, center_y + leaf_height // 2),  # bottom
        (center_x - leaf_width, center_y),   # left
    ]
    
    draw.polygon(leaf_points, fill=white + (255,))
    
    # Save
    img.save(output_path, 'PNG')
    print(f"✓ Generated {Path(output_path).name} ({size}x{size})")

def main():
    """Generate all required icons."""
    icons_dir = Path('public/icons')
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    print("🎨 Generating EcoPlay PWA Icons...")
    print()
    
    # Generate icons in all required sizes
    icon_configs = [
        (192, 'icon-192x192.png', False),
        (512, 'icon-512x512.png', False),
        (192, 'icon-192x192-maskable.png', True),
        (512, 'icon-512x512-maskable.png', True),
    ]
    
    for size, filename, maskable in icon_configs:
        output_path = icons_dir / filename
        generate_ecoplay_icon(size, str(output_path), maskable)
    
    print()
    print("✅ Icon generation complete!")
    print(f"📁 Icons saved to: {icons_dir}")
    print()
    print("Next steps:")
    print("1. Review the generated icons")
    print("2. Replace with professional designer-created icons if needed")
    print("3. Test PWA installability with Lighthouse")
    print("4. Test on iOS Safari and Android Chrome")

if __name__ == '__main__':
    main()
