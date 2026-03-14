#!/usr/bin/env python3
"""Generate LED Board app icon - rainbow dot-matrix text on dark grid."""

from PIL import Image, ImageDraw, ImageFilter
import math

SIZE = 1024
PADDING = 60

# 5x7 dot matrix font (bit 6 = top, bit 0 = bottom)
FONT = {
    'L': [0b1111111,0b0000001,0b0000001,0b0000001,0b0000001],
    'E': [0b1111111,0b1001001,0b1001001,0b1001001,0b1000001],
    'D': [0b1111111,0b1000001,0b1000001,0b1000001,0b0111110],
    'B': [0b1111111,0b1001001,0b1001001,0b1001001,0b0110110],
    'O': [0b0111110,0b1000001,0b1000001,0b1000001,0b0111110],
    'A': [0b0111111,0b1001000,0b1001000,0b1001000,0b0111111],
    'R': [0b1111111,0b1001000,0b1001100,0b1001010,0b0110001],
}

CHAR_W = 5
CHAR_H = 7

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def get_rainbow_color(t):
    """Rainbow gradient: red -> yellow -> green -> cyan -> blue -> magenta"""
    colors = [
        (255, 0, 0),    # red
        (255, 255, 0),  # yellow
        (0, 255, 0),    # green
        (0, 255, 255),  # cyan
        (0, 100, 255),  # blue
        (255, 0, 255),  # magenta
    ]
    t = t % 1.0
    idx = t * (len(colors) - 1)
    i = int(idx)
    f = idx - i
    if i >= len(colors) - 1:
        return colors[-1]
    return lerp_color(colors[i], colors[i + 1], f)

def draw_dot(draw, x, y, r, color, glow_layers=None):
    """Draw a lit LED dot with glow."""
    if glow_layers is None:
        glow_layers = []
    # Glow layers (drawn on separate image for blur)
    # Core dot
    draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

def main():
    # Create base image
    img = Image.new('RGB', (SIZE, SIZE), (10, 10, 15))
    draw = ImageDraw.Draw(img)

    # Layout: "LED" on top row, "BOARD" on bottom row
    top_text = "LED"
    bot_text = "BOARD"

    # Calculate sizing
    # Total char columns: max(3*5 + 2gaps, 5*5 + 4gaps)
    # "BOARD" = 5 chars, widest line
    max_chars = 5
    total_dot_cols = max_chars * CHAR_W + (max_chars - 1)  # 1 col gap between chars
    total_dot_rows = 2 * CHAR_H + 2  # 2 row gap between lines

    usable = SIZE - PADDING * 2
    dot_spacing = usable / max(total_dot_cols, total_dot_rows * (usable / usable))
    # Make it fit both dimensions
    dot_spacing_x = usable / total_dot_cols
    dot_spacing_y = usable / total_dot_rows
    dot_spacing = min(dot_spacing_x, dot_spacing_y)
    dot_r = dot_spacing * 0.35

    # Center the grid
    grid_w = total_dot_cols * dot_spacing
    grid_h = total_dot_rows * dot_spacing
    offset_x = (SIZE - grid_w) / 2
    offset_y = (SIZE - grid_h) / 2

    # Draw background dot grid across entire image
    bg_spacing = dot_spacing
    bg_r = dot_r * 0.5
    cols = int(SIZE / bg_spacing) + 2
    rows = int(SIZE / bg_spacing) + 2
    bg_off_x = (SIZE % bg_spacing) / 2
    bg_off_y = (SIZE % bg_spacing) / 2

    for row in range(rows):
        for col in range(cols):
            x = bg_off_x + col * bg_spacing
            y = bg_off_y + row * bg_spacing
            draw.ellipse([x - bg_r, y - bg_r, x + bg_r, y + bg_r], fill=(25, 25, 30))

    # Create glow layer
    glow_img = Image.new('RGB', (SIZE, SIZE), (0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)

    # Draw text characters
    def draw_text_line(text, line_y_start, x_offset):
        total_line_cols = len(text) * CHAR_W + (len(text) - 1)
        line_x_start = (SIZE - total_line_cols * dot_spacing) / 2

        for ci, ch in enumerate(text):
            col_data = FONT.get(ch)
            if not col_data:
                continue
            # Rainbow color based on character position across both lines
            t = (x_offset + ci) / 8.0  # spread across total chars
            color = get_rainbow_color(t)
            # Brighter version for core
            bright = tuple(min(255, int(c * 1.0)) for c in color)
            # Dimmer for glow
            glow_color = tuple(min(255, int(c * 0.8)) for c in color)

            char_x = line_x_start + ci * (CHAR_W + 1) * dot_spacing

            for c in range(CHAR_W):
                bits = col_data[c]
                for r in range(CHAR_H):
                    if bits & (1 << r):
                        x = char_x + c * dot_spacing
                        y = line_y_start + (CHAR_H - 1 - r) * dot_spacing
                        # Glow
                        gr = dot_r * 3
                        glow_draw.ellipse([x - gr, y - gr, x + gr, y + gr], fill=glow_color)
                        # Core dot
                        draw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=bright)
                        # Hot center
                        hr = dot_r * 0.5
                        center_color = tuple(min(255, c + 100) for c in bright)
                        draw.ellipse([x - hr, y - hr, x + hr, y + hr], fill=center_color)

    # Top line: "LED"
    top_y = offset_y
    draw_text_line(top_text, top_y, 0)

    # Bottom line: "BOARD"
    bot_y = offset_y + (CHAR_H + 2) * dot_spacing
    draw_text_line(bot_text, bot_y, 3)

    # Blur glow and composite
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=dot_r * 1.5))

    # Composite glow under main image using screen blend
    from PIL import ImageChops
    # Add glow to base
    result = ImageChops.add(img, glow_img)

    # Add a second brighter glow pass
    glow_img2 = glow_img.filter(ImageFilter.GaussianBlur(radius=dot_r * 2.5))
    result = ImageChops.add(result, glow_img2)

    # Add sparkle highlights at a few corners
    sparkle_img = Image.new('RGB', (SIZE, SIZE), (0, 0, 0))
    sparkle_draw = ImageDraw.Draw(sparkle_img)
    sparkles = [(SIZE * 0.85, SIZE * 0.12), (SIZE * 0.15, SIZE * 0.88), (SIZE * 0.92, SIZE * 0.55)]
    for sx, sy in sparkles:
        sr = 20
        sparkle_draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 255, 255))
    sparkle_img = sparkle_img.filter(ImageFilter.GaussianBlur(radius=15))
    result = ImageChops.add(result, sparkle_img)

    # Save
    result.save('/Users/obando/github-repos/led-board/apps/expo/assets/icon.png')
    print(f'Icon saved: {SIZE}x{SIZE}')

    # Also save adaptive icon (Android needs foreground layer)
    result.save('/Users/obando/github-repos/led-board/apps/expo/assets/adaptive-icon.png')
    print('Adaptive icon saved')

if __name__ == '__main__':
    main()
