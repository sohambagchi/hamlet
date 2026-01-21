from PIL import Image
import os
import sys

# Configuration
SOURCE_DIR = 'public/assets/sprites/characters/hamlet'
OUTPUT_FILE = 'public/assets/sprites/characters/hamlet/hamlet_unified.png'

# Grid settings
CELL_SIZE = 64
ROWS_PER_DIRECTION = 4 # S, W, N, E (Assumed)

def process():
    if not os.path.exists(SOURCE_DIR):
        print("Source directory not found")
        return

    # 1. Load Idle-Walk-Run
    # Expectation: 5 columns (Idle, Walk1, Walk2, Run1, Run2)
    # Rows: 0=South, 1=West, 2=North, 3=East (Assumed standard order)
    idle_file = os.path.join(SOURCE_DIR, 'idle-walk2-run2.png')
    
    if not os.path.exists(idle_file):
        print(f"File missing: {idle_file}")
        return

    img_idle = Image.open(idle_file)
    
    # Create new image
    # Width: 5 frames * 64 = 320
    # Height: 4 rows * 64 = 256
    unified_w = 320
    unified_h = 256
    
    unified = Image.new("RGBA", (unified_w, unified_h))
    
    # Crop the top-left 320x256 block
    # Logic: We assume the first 4 rows and first 5 columns contain the core movement data.
    # If the source is 23 columns wide, the rest are likely diagonals or other variants.
    # We take the "Cardinal" set.
    crop_area = (0, 0, 320, 256)
    movement_block = img_idle.crop(crop_area)
    
    unified.paste(movement_block, (0, 0))
    
    # Save
    unified.save(OUTPUT_FILE)
    print(f"Saved unified spritesheet to {OUTPUT_FILE} ({unified_w}x{unified_h})")

if __name__ == "__main__":
    process()
