Alejandro U. Alvarez
==================

My personal website, hosted here on Github. I have moved my blog here as well, using Hugo for it's management. I migrated it from Jekyll, which I had migrated from WordPress. Migrating from Wordpress took a bit of time but using some plugins and spending a little time fixing things up it was easy.

The web/blog can be accessed with the usual address: <del>http://urbanoalvarez.es</del> https://aurbano.eu

## Running locally

```
git submodule update --init --recursive

brew install hugo

hugo serve
```

## Update thumbnail colors
For posts in the homepage, I extract the dominant color and use it as the background for each tile. This is done by running `python3 scripts/colors.py`.

The script uses the `ColorThief` module, which must be installed (`pip install colorthief`)

- - - -

Most of it is copyrighted material, please contact if you have any concern
[![Analytics](https://ga-beacon.appspot.com/UA-3181088-16/aurbano/readme)](https://github.com/aurbano)
