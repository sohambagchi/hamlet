from PIL import Image
import os

INPUT_FILE = 'public/assets/sprites/characters/hamlet/hamlet_unified.png'
OUTPUT_FILE = 'public/assets/sprites/characters/hamlet/hamlet_unified.png' # Overwrite

TARGET_FRAME_SIZE = 64
GRID_COLS = 6
GRID_ROWS = 4

def resize_sprite():
    if not os.path.exists(INPUT_FILE):
        print(f"File not found: {INPUT_FILE}")
        return

    img = Image.open(INPUT_FILE)
    w, h = img.size
    print(f"Original Dimensions: {w} x {h}")
    
    # Calculate target size
    target_w = GRID_COLS * TARGET_FRAME_SIZE
    target_h = GRID_ROWS * TARGET_FRAME_SIZE
    
    print(f"Target Dimensions: {target_w} x {target_h}")
    
    # Resize with high quality resampling (Lanczos)
    # Using Nearest Neighbor might be better for pixel art if the source was pixel art scaled up,
    # but 460 -> 64 is a weird ratio (7.18x). 
    # If the user drew high-res art (460px), we probably want nice downsampling (LANCZOS).
    # If it's pixel art that was scaled up, NEAREST is better.
    # Given the weird dimension (460), it's likely high-res source art. Let's use LANCZOS.
    resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    resized.save(OUTPUT_FILE)
    print(f"Resized image saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    resize_sprite()
