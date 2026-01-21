from PIL import Image
import os
import sys

def map_sprite(filepath, cell_w=64, cell_h=64):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    img = Image.open(filepath)
    w, h = img.size
    cols = w // cell_w
    rows = h // cell_h

    print(f"Mapping: {os.path.basename(filepath)} ({cols} cols x {rows} rows)")
    
    grid = []
    
    for r in range(rows):
        row_str = ""
        for c in range(cols):
            x = c * cell_w
            y = r * cell_h
            # Crop the cell
            cell = img.crop((x, y, x + cell_w, y + cell_h))
            # Check for content (simple bbox check on the cell)
            if cell.getbbox():
                row_str += "#" # Content
            else:
                row_str += "." # Empty
        grid.append(row_str)
        print(f"{r:02d}: {row_str}")

files = [
    'public/assets/sprites/characters/hamlet/idle-walk2-run2.png',
    'public/assets/sprites/characters/hamlet/combat1.png',
    'public/assets/sprites/characters/hamlet/special.png'
]

for f in files:
    map_sprite(f)
    print("\n" + "="*40 + "\n")
