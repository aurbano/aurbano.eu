from colorthief import ColorThief
from os import walk
import json

img_path = '../assets/thumbnails'

filenames = next(walk(img_path), (None, None, []))[2]

colors = {}

for image in filenames:
  color_thief = ColorThief(img_path + '/' + image)
  # get the dominant color
  dominant_color = color_thief.get_color(quality=1)

  colors[image] = str(dominant_color)

print(colors)

with open('../data/colors.json', 'w') as outfile:
    json.dump(colors, outfile, indent=4)
