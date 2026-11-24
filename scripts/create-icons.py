"""Export the user-supplied logo at the sizes required by each platform."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'NgaNgo.Web' / 'wwwroot' / 'icons'
root.mkdir(parents=True, exist_ok=True)
original=Image.open(root.parent/'images/aymi-logo-original.png').convert('RGB')
for size, name in [(180,'apple-touch-icon'), (192,'icon-192'), (512,'icon-512'), (1024,'icon-1024')]:
    image=original.resize((size,size),Image.Resampling.LANCZOS)
    image.save(root / (name+'.png'))
    if size == 512:
        image.save(root / 'russian-kitty.ico', sizes=[(16,16),(32,32),(48,48),(128,128),(256,256)])
    if size == 1024:
        native = root.parents[2] / 'NgaNgo.App' / 'ios' / 'App' / 'App' / 'Assets.xcassets' / 'AppIcon.appiconset'
        # Native iOS export; keep the supplied artwork unchanged.
        if native.is_dir(): image.save(native / 'AppIcon-512@2x.png')
