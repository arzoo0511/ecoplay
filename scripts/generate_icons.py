import sys
from pathlib import Path
from PIL import Image, ImageDraw

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
    
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if maskable:
        # For maskable icons, use a smaller center area for safe display
        safe_margin = int(size * 0.15)
    else:
        safe_margin = int(size * 0.1)
    
    # Draw background circle
    bg_radius = size // 2 - int(safe_margin * 0.5)
    bg_x = size // 2 - bg_radius
    bg_y = size // 2 - bg_radius
    draw.ellipse(
        [bg_x, bg_y, bg_x + bg_radius * 2, bg_y + bg_radius * 2],
        fill=background_color + (255,)
    )
    
    # Draw green circle background
    circle_radius = size // 2 - safe_margin
    circle_x = size // 2 - circle_radius
    circle_y = size // 2 - circle_radius
    draw.ellipse(
        [circle_x, circle_y, circle_x + circle_radius * 2, circle_y + circle_radius * 2],
        fill=accent_color + (255,)
    )
    
    # Draw leaf shape (stylized)
    center_x = size // 2
    center_y = size // 2
    leaf_width = int(circle_radius * 0.5)
    leaf_height = int(circle_radius * 0.7)
    
    # Create leaf outline points
    leaf_points = [
        (center_x, center_y - leaf_height),  # top point
        (center_x + leaf_width, center_y - leaf_height // 3),  # upper right
        (center_x + leaf_width * 0.7, center_y + leaf_height // 2),  # lower right
        (center_x, center_y + leaf_height // 2),  # bottom point
        (center_x - leaf_width * 0.7, center_y + leaf_height // 2),  # lower left
        (center_x - leaf_width, center_y - leaf_height // 3),  # upper left
    ]
    
    draw.polygon(leaf_points, fill=white + (255,))
    
    # Draw leaf vein (center line)
    vein_points = [
        (center_x, center_y - leaf_height),
        (center_x, center_y + leaf_height // 2)
    ]
    draw.line(vein_points, fill=accent_color + (180,), width=max(1, size // 128))
    
    # Save
    img.save(output_path, 'PNG')
    print(f"✓ Generated {Path(output_path).name} ({size}x{size})")

def generate_screenshot(width: int, height: int, output_path: str):
    """Generate a simple screenshot placeholder."""
    background_color = (2, 6, 23)  # #020617
    accent_color = (16, 185, 129)  # #10b981
    
    img = Image.new('RGBA', (width, height), background_color + (255,))
    draw = ImageDraw.Draw(img)
    
    # Draw accent bar at top
    draw.rectangle([0, 0, width, height // 8], fill=accent_color + (255,))
    
    # Draw some placeholder content
    center_x = width // 2
    center_y = height // 2
    radius = min(width, height) // 6
    draw.ellipse(
        [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
        fill=accent_color + (255,)
    )
    
    img.save(output_path, 'PNG')
    print(f"✓ Generated {Path(output_path).name} ({width}x{height})")

def main():
    """Generate all required icons and screenshots."""
    icons_dir = Path('public/icons')
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    print("🎨 Generating EcoPlay PWA Icons and Screenshots...")
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
    print("📸 Generating screenshot placeholders...")
    print()
    
    # Generate screenshots
    screenshot_configs = [
        (540, 720, 'screenshot-540x720.png'),
        (1280, 720, 'screenshot-1280x720.png'),
    ]
    
    for width, height, filename in screenshot_configs:
        output_path = icons_dir / filename
        generate_screenshot(width, height, str(output_path))
    
    print()
    print("✅ Icon and screenshot generation complete!")
    print(f"📁 Icons saved to: {icons_dir}")
    print()
    print("📋 Generated files:")
    print("  • icon-192x192.png")
    print("  • icon-512x512.png")
    print("  • icon-192x192-maskable.png")
    print("  • icon-512x512-maskable.png")
    print("  • screenshot-540x720.png")
    print("  • screenshot-1280x720.png")
    print()
    print("✨ Next steps:")
    print("1. Review the generated icons")
    print("2. Optionally replace with professional designer icons")
    print("3. Run Lighthouse PWA audit: npm run build && npm run preview")
    print("4. Test on iOS Safari and Android Chrome devices")

if __name__ == '__main__':
    main()
