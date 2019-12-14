---
categories:
- Main
date: "2014-11-08T00:00:00Z"
description: Zsh is already pretty powerful, but it can still be extended into the
  best possible shell.
tagline: And why it's better than fish
tags:
- zsh
- shell
- apple
- mac
thumbnail: /assets/files/thumbnails/zsh.png
title: My Interesting Zsh Prompt
---

I already did a post on [the steps I took]({% post_url 2014-11-03-setting-up-mac-for-development %}) to set up my new macbook for development.

After that post I started using Zsh more and more, and came to realize how much better it could become with some tweaking.

<div class="caption">
    <img src="/assets/files/posts/zsh/shell.png" alt="edges" class="img img-responsive" style="border:none"><br />
</div>

If you just want to replicate this just follow these two steps:

1. Install [antigen](https://github.com/zsh-users/antigen):
2. ``` bash
curl -L https://raw.githubusercontent.com/zsh-users/antigen/master/antigen.zsh > antigen.zsh
source antigen.zsh
```
3. Use [this `.zshrc`](https://gist.github.com/aurbano/e32596aae16a7b9f8b48) file.

-------

## Walkthrough

The first thing I recommend is using [antigen](https://github.com/zsh-users/antigen). It is something like Pathogen for Vim, a configuration/plugin manager for Zsh.

It works great with [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh), which should also be your first step into setting up your zsh shell.

Once antigen is installed the first part of the `.zshrc` file is setting that up and loading Oh My Zsh.

``` bash
# Antigen — A zsh plugin manager
export ANTIGEN_DEFAULT_REPO_URL=https://github.com/sharat87/oh-my-zsh.git
source ~/antigen.zsh

# Load the oh-my-zsh's library.
antigen use oh-my-zsh
```

Now load all the plugins (bundles) you want, the great thing about antigen is that you can add any plugin from any repository/url:

``` bash
antigen bundles <<EOBUNDLES

lein
pip
gradle
brew
gem
npm
sublime
python
#...

EOBUNDLES
```

## Extras

### Automaticcally list directory on cd

I find this really useful, it triggers an `ls` whenever you `cd` into a directory.

``` bash
# Automatically list directory contents on `cd`.
auto-ls () { ls; }
chpwd_functions=( auto-ls $chpwd_functions )
```

### History search

We add the history substring plugin to enable fish style search, first add the plugin: `zsh-users/zsh-history-substring-search`.

Now we can bind the search to Up/Down arrows:

``` bash
# bind UP and DOWN arrow keys
zmodload zsh/terminfo
bindkey "$terminfo[kcuu1]" history-substring-search-up
bindkey "$terminfo[kcud1]" history-substring-search-down
```

### Fish-style autosuggest

A great plugin that shows the first suggestion in light grey as suggestion as you type. It might have some small bugs but for the most part it works great.

Add the plugin: `tarruda/zsh-autosuggestions`

Set it up:
``` bash
# Setup suggestions
zle-line-init() {
    zle autosuggest-start
}
zle -N zle-line-init
```
