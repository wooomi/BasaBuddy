"""Lossless, native-resolution crops of the supplied BasaBuddy reference sheets.
No generation, resampling, sharpening, recoloring or destructive white-keying.
White matte is retained to protect white eyes, feathers, pages and soft shadows.
"""
from pathlib import Path
from PIL import Image
import json
ROOT = Path(__file__).resolve().parent.parent
CROPS = {
 'characters': {
 'logos/wordmark': (40, 5, 610, 310),
 'mascots/reading': (612, 3, 943, 321),
 'mascots/encouraging': (954, 15, 1262, 322),
 'logos/app-icon': (1280, 24, 1595, 321),
 'characters/student': (43, 320, 310, 605),
 'characters/reader': (311, 322, 584, 606),
 'characters/reader-glasses': (585, 327, 829, 605),
 'characters/schoolboy': (834, 322, 1053, 605),
 'characters/schoolgirl': (1056, 328, 1304, 605),
 'objects/books': (14, 609, 315, 798),
 'objects/open-book': (318, 620, 622, 797),
 'objects/pencil': (624, 615, 737, 796),
 'objects/blocks': (736, 607, 976, 798),
 'icons/star': (30, 800, 183, 940),
 'icons/medal': (193, 800, 317, 940),
 'icons/trophy': (331, 800, 490, 940),
 'icons/crown': (499, 800, 662, 940),
 'icons/target': (668, 800, 834, 940),
 'icons/speaker': (839, 805, 982, 940),
 'icons/microphone': (994, 807, 1109, 940),
 },
 'mascots': {
 'mascots/reading-full': (34, 505, 383, 895),
 'mascots/thumbs-up': (388, 510, 707, 895),
 'mascots/celebrating': (714, 508, 1104, 893),
 'objects/apple': (589, 895, 812, 1142),
 },
 'learning': {
 'mascots/backpack': (5, 5, 334, 450),
 'icons/listen': (39, 904, 160, 1004),
 'icons/puzzle': (215, 904, 329, 1004),
 'icons/read': (377, 909, 501, 1005),
 'icons/dictionary': (561, 908, 683, 1005),
 'icons/games': (724, 913, 851, 1004),
 },
 'features': {
 'backgrounds/classroom': (30, 365, 560, 623),
 'backgrounds/meadow': (568, 365, 1057, 623),
 'backgrounds/sky': (1064, 365, 1549, 623),
 },
 'backgrounds': {
 'backgrounds/park': (26, 153, 690, 578),
 'backgrounds/school': (740, 153, 1416, 578),
 'objects/cloud': (1467, 175, 2118, 541),
 }
}
manifest = {}
for source, entries in CROPS.items():
 image = Image.open(ROOT / 'reference/asset-sheets' / (source+'.png'))
 for name, box in entries.items():
  crop = image.crop(box)
  path = ROOT / 'public/assets' / (name+'.webp')
  path.parent.mkdir(parents=True, exist_ok=True)
  crop.save(path, 'WEBP', lossless=True, method=6)
  manifest[name] = {'src':'/assets/'+name+'.webp', 'width':crop.width, 'height':crop.height, 'source':source+'.png', 'crop':box, 'bytes':path.stat().st_size}
# Preserve the user's simplified wordmark when rebuilding the asset collection.
wordmark_edit = ROOT / 'reference/asset-edits/wordmark-simple.png'
if wordmark_edit.exists():
 image = Image.open(wordmark_edit)
 target = ROOT / 'public/assets/logos/wordmark.webp'
 image.save(target, 'WEBP', lossless=True, method=6)
 manifest['logos/wordmark'] = {'src':'/assets/logos/wordmark.webp', 'width':image.width, 'height':image.height, 'source':'asset-edits/wordmark-simple.png', 'edit':'User-requested removal of top decorations', 'bytes':target.stat().st_size}
# Retain existing illustrations when no matching higher-quality original is supplied.
for name in ['cat', 'dog', 'bird', 'rabbit', 'turtle', 'penguin', 'teacher', 'story', 'sentence', 'puzzle', 'celebrate']:
 import shutil
 category = 'characters' if name == 'teacher' else 'illustrations'
 target = ROOT / 'public/assets' / category / (name+'.webp')
 target.parent.mkdir(parents=True, exist_ok=True)
 shutil.copyfile(ROOT / 'reference/legacy-assets' / (name+'.webp'), target)
 image = Image.open(target)
 manifest[name] = {'src': '/assets/'+category+'/'+name+'.webp', 'width':image.width, 'height':image.height, 'source':'legacy original', 'status':'Higher-quality matching original needed', 'bytes':target.stat().st_size}
# Use the sharper supplied character-sheet originals at the existing public URLs.
# Retain legacy files in reference/legacy-assets for historical comparison.
import shutil
for key, source_key, target_path in [
 ('teacher', 'characters/reader-glasses', '/assets/characters/teacher.webp'),
]:
 source = manifest[source_key]
 target = ROOT / ('public'+target_path)
 shutil.copyfile(ROOT / ('public'+source['src']), target)
 manifest[key] = {**source, 'src':target_path, 'replaces':'pixelated legacy crop', 'bytes':target.stat().st_size}
welcome_target = ROOT / 'public/assets/mascots/welcome-original.webp'
shutil.copyfile(ROOT / 'reference/legacy-assets/owl.webp', welcome_target)
welcome_image = Image.open(welcome_target)
manifest['mascots/welcome-original'] = {
 'src':'/assets/mascots/welcome-original.webp',
 'width':welcome_image.width,
 'height':welcome_image.height,
 'source':'reference/legacy-assets/owl.webp',
 'bytes':welcome_target.stat().st_size,
}
(ROOT/'src/data/assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Extracted {len(manifest)} lossless native-resolution assets.')
