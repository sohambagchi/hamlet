from PIL import Image
import os

files = [
    'public/assets/sprites/characters/hamlet/idle-walk2-run2.png',
    'public/assets/sprites/characters/hamlet/combat1.png',
    'public/assets/sprites/characters/hamlet/special.png'
]

for f in files:
    if os.path.exists(f):
        img = Image.open(f)
        print(f"FILE: {os.path.basename(f)}")
        print(f"DIMENSIONS: {img.size}")
        print(f"BBOX: {img.getbbox()}")
        print("-" * 20)
    else:
        print(f"FILE: {f} NOT FOUND")
