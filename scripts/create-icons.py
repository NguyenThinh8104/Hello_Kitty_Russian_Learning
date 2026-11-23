"""Generate code-native PWA icons; requires Pillow from the bundled runtime."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / 'NgaNgo.Web' / 'wwwroot' / 'icons'
root.mkdir(parents=True, exist_ok=True)
for size, name in [(180,'apple-touch-icon'), (192,'icon-192'), (512,'icon-512'), (1024,'icon-1024')]:
    image = Image.new('RGB', (size,size), '#bd4774')
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', round(size*.57))
    draw.text((size*.21,size*.13), 'Я', font=font, fill='white')
    # Heart kept within the maskable safe region.
    x,y,r = size*.68,size*.39,size*.065
    draw.ellipse((x-2*r,y-r,x,y+r),fill='#e98372')
    draw.ellipse((x,y-r,x+2*r,y+r),fill='#e98372')
    draw.polygon([(x-2*r,y),(x+2*r,y),(x,y+3*r)],fill='#e98372')
    image.save(root / (name+'.png'))
    if size == 512:
        image.save(root / 'russian-kitty.ico', sizes=[(16,16),(32,32),(48,48),(128,128),(256,256)])
    if size == 1024:
        native = root.parents[2] / 'NgaNgo.App' / 'ios' / 'App' / 'App' / 'Assets.xcassets' / 'AppIcon.appiconset'
        # Repository code-native icon, rendered at iOS's required size.
        if native.is_dir(): image.save(native / 'AppIcon-512@2x.png')
