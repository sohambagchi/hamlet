from PIL import Image, ImageDraw

FILE = 'public/assets/sprites/characters/hamlet/hamlet_unified.png'

def remove_bg():
    img = Image.open(FILE).convert("RGBA")
    
    # Get background color from top-left pixel
    bg_color = img.getpixel((0, 0))
    print(f"Background Color detected: {bg_color}")
    
    # Define replacement color (Transparent)
    # Note: floodfill requires the image to be "RGB" or "RGBA"
    # value is the color to fill with.
    
    # Tolerance logic is tricky with standard ImageDraw.floodfill.
    # It expects an exact match or a threshold.
    # Since I resized with Lanczos, there might be noise.
    # However, floodfill in Pillow doesn't inherently support 'fuzziness' easily without custom logic.
    # Let's try exact match first. If it was a pure white bg resized, the vast majority is still pure white.
    # The edges might have anti-aliasing which will remain as 'halos'.
    
    # Attempting to floodfill using ImageDraw
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=50) 
    # thresh=50 allows for some variance (e.g. anti-aliasing near edges)
    
    img.save(FILE)
    print(f"Saved background-removed image to {FILE}")

if __name__ == "__main__":
    remove_bg()
