#!/usr/bin/env python3
"""Resize icon.png into all Android mipmap sizes as webp."""
from PIL import Image
import os

BASE = '/Users/obando/github-repos/led-board/apps/expo'
SRC = os.path.join(BASE, 'assets/icon.png')
RES = os.path.join(BASE, 'android/app/src/main/res')

# Android mipmap sizes
SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# Adaptive icon foreground (with padding) sizes
FOREGROUND_SIZES = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
}

img = Image.open(SRC)

for folder, size in SIZES.items():
    out_dir = os.path.join(RES, folder)
    os.makedirs(out_dir, exist_ok=True)

    # Launcher icon
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(os.path.join(out_dir, 'ic_launcher.webp'), 'WEBP', quality=90)
    resized.save(os.path.join(out_dir, 'ic_launcher_round.webp'), 'WEBP', quality=90)
    print(f'{folder}: {size}x{size}')

for folder, size in FOREGROUND_SIZES.items():
    out_dir = os.path.join(RES, folder)
    os.makedirs(out_dir, exist_ok=True)

    # Foreground with safe zone padding (icon is 66% of foreground)
    fg = Image.new('RGBA', (size, size), (10, 10, 15, 255))
    icon_size = int(size * 0.72)
    icon_resized = img.resize((icon_size, icon_size), Image.LANCZOS)
    offset = (size - icon_size) // 2
    fg.paste(icon_resized, (offset, offset))
    fg.save(os.path.join(out_dir, 'ic_launcher_foreground.webp'), 'WEBP', quality=90)
    print(f'{folder} foreground: {size}x{size}')

# Also update splash screen logo
drawable = os.path.join(RES, 'drawable')
os.makedirs(drawable, exist_ok=True)
splash = img.resize((288, 288), Image.LANCZOS)
splash.save(os.path.join(drawable, 'splashscreen_logo.png'), 'PNG')
print('Splash logo updated')

print('Done!')
