Alejandro U. Alvarez
==================

My personal website, hosted here on Github. I have moved my blog here as well, using Hugo for it's management. I migrated it from Jekyll, which I had migrated from WordPress. Migrating from Wordpress took a bit of time but using some plugins and spending a little time fixing things up it was easy.

Access at https://aurbano.eu

## Running locally

```
# install
brew install hugo
npm install
# run
hugo serve
```

Run `hugo` to build the site and regenerate Tailwind CSS after template or style changes.

## Layout and typography

Shared reading styles live in `assets/css/main.css`: restrained serif headings, a 65-character prose measure, responsive gutters, visible keyboard focus, and reduced-motion support. The homepage reveals a continuous aperiodic tiling through broad section bands and its outer margins, keeping text on solid paper-colored panels. Article pages stay pattern-free. Page entrances, menu opening, gallery opening, and card hovers use short 160–240ms animations.

The pattern uses the [H7/H8 hat-family construction](https://cs.uwaterloo.ca/~csk/hat/h7h8.html). `assets/js/einstein-tiling-core.js` computes symbolic edge lengths and tile placements together; the browser and geometry tests use this same implementation. Over a 24-second cycle, edge proportions vary slightly around the classic hat while each tile keeps its area and the camera stays fixed. Coordinate buffers are reused, offscreen hats are culled, and drawing is limited to 30fps. Inactive tabs stop rendering; reduced-motion preferences retain a still pattern. `npm test` checks area preservation, real shape change, shared boundaries, and the absence of gaps and overlaps.

Photography uses `assets/css/photography.css` and dependency-free `static/js/photography.js`. Galleries preserve natural image proportions and use one, two, or three columns depending on viewport width. The full-size viewer supports keyboard navigation, focus restoration, and existing `#photo-<filename>` links.

The photo host blocks localhost referrers. For local visual verification, send `https://aurbano.eu/` as the referrer on requests to `photos.aurbano.eu`; otherwise images return HTTP 403. This is an existing hosting restriction, not a gallery layout failure.

## Update thumbnail colors
For posts in the homepage, I extract the dominant color and use it as the background for each tile. This is done by running `python3 scripts/colors.py`.

The script uses the `ColorThief` module, which must be installed (`pip install colorthief`)

- - - -

Most of it is copyrighted material, please contact if you have any concern
[![Analytics](https://ga-beacon.appspot.com/UA-3181088-16/aurbano/readme)](https://github.com/aurbano)
