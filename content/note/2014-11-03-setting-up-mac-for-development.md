---
categories:
- Main
date: "2014-11-03T00:00:00Z"
description: Process of setting up a new Mac as a developer, coming from a Windows
  background
tagline: Coming from Windows
tags:
- apple
- mac
thumbnail: /assets/files/thumbnails/xcode.jpg
title: Setting up Mac for development
---

So I recently got [a new Macbook Air]({{< ref "2014-10-21-mac-shanghai-to-spain" >}}), and after a couple of weeks of installing and configuring I finally have an initial setup I'm happy with.

## Step 1
Setup, install Yosemite, open System Preferences and change everything.

Remove most things from the dock, change the theme to Dark.

Play with the trackpad gestures, didn't understand the reason for the dashboard. Love Mission control though, I need to learn some keyboard shortcuts. I have a Spanish keyboard, so for the shortcuts `alt` might be `opt`.

* <kbd>Enter</kbd> renames files.
* <kbd>cmd+space</kbd> opens Spotlight. I've heard a lot about [Alfred](http://www.alfredapp.com), but for now I don't feel like I need it.
* <kbd>cmd+alt+esc</kbd> it's the `ctrl+alt+del` of Mac, I only needed it once though.
* <kbd>cmd+Q</kbd> Actually close the current app.
* <kbd>cmd+Arrow</kbd> Right/Left for Start/End of line. Up/Down for Start/End of document.

Also, right click can be setup as two finger click. Drag and text selection with 3 fingers, I almost feel like playing piano using the Mac...

<div class="caption">
    <img src="/assets/files/posts/mac/mission_control.jpg" alt="edges" class="img img-responsive"><br />
    Mission Control
</div>

## Step 2

Install [Homebrew](http://brew.sh/):

``` bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

This is the missing Mac version of `apt-get`, kind of.

Update your packages list: `brew update`

Make sure everything is fine: `brew doctor`, follow any recommendations.

If `brew` doesn't work as a command add this to your bash/zsh profile:

``` bash
export PATH="/usr/local/bin:$PATH"
```

Install node: `brew install node`

Install python: `brew install python`. It comes with setuptools and pip already :) More info [here](http://docs.python-guide.org/en/latest/starting/install/osx/).

Install git: `brew install git`

Now enable Keychain for Git, this is a really good feature that allows you to stop entering the user/pass on every push you do. You can also use the ssh url, but that requires you to change it if you clone using the app...

``` bash
git config --global credential.helper osxkeychain
```

## Step 3

Install xcode (App Store), it takes a while so I'll do other things while it's at it.

It turns out that installing apps downloaded from the Internet is quite simple. You'll usually get a `.dmg` file, which is a disk image file (similar to `.iso`). They normally contain the app and a shortcut to the apps folder, drag the app there and done. If you don't get the shortcut open finder and drag it into the Applications folder.

Sometimes you get a `.pkg`, they are usually installers.

Install [Sublime Text 3](http://www.sublimetext.com/3), import plugins from my Windows machine. For reference I use the following:

* [AngularJS](https://github.com/angular-ui/AngularJS-sublime-package): Does some autocomplete for html, javascript...
* [AutoFileName](https://github.com/BoundInCode/AutoFileName): Dropdown completion for paths, it's slightly buggy sometimes but works fine overall.
* [DocBlockr](https://github.com/spadgos/sublime-jsdocs): Help with /** comments
* [Emmet](https://github.com/sergeche/emmet-sublime): You don't understand how boring is typing html until you learn how to use Emmet. Seriously.
* [FTPSync](https://github.com/NoxArt/SublimeText2-FTPSync): I rarely use FTP any more, but this allows you to easily upload/download changes from ST.
* [Git](https://github.com/kemayo/sublime-text-git): I prefer an actual git console, but this displays useful information on the status bar.
* [Jekyll](http://23maverick23.github.io/sublime-jekyll/): Text formatting and some completion.
* [JsFormat](https://github.com/jdc0589/JsFormat): Auto formats javascript on save, and some other things.
* [Markdown editing](https://github.com/SublimeText-Markdown/MarkdownEditing): Good companion for a Jekyll site, also useful if you edit Readme files.
* [Package Control](https://sublime.wbond.net/)
* [Github](https://github.com/bgreenlee/sublime-github): Good gist support, I think  it also does some other things though.
* [LaTeXTools](https://github.com/SublimeText/LaTeXTools): I'll expand on this later on.
* [SublimeCodeIntel](https://github.com/SublimeCodeIntel/SublimeCodeIntel): Turn ST into more of an IDE, smart autocomplete and some other things.


## Step 4

Open xcode, new playground project, take a look around: It looks really cool, but I don't have time right now. Moving on.

Install Chrome. Safari works really well but all my stuff is already in Chrome. It uses more battery apparently, but I'm sure they'll fix that soon.

I'll set up LaTeX now. It turns out Miktex is not available, but we have [Mactex](https://tug.org/mactex/).

I'm going to be using Sublime Text for editing, with the LaTeXTools package. I'm only using two of its features:

* <kbd>cmd+B</kbd> Builds as usual.
* <kbd>cmd+L, V</kbd> Open the generated pdf, I can't get it to jump to the cursor though.

## Step 5

The default Terminal looks ok, but needs a lot of work.

I prefer Zsh over Bash, and [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh) is the best way of getting that to work. Run their custom installer:

`curl -L http://install.ohmyz.sh | sh`


Oh My Zsh is basically a set of configuration settings and plugins that make your life a lot easier. Open a new Terminal window, if zsh is not already there run `chsh -s /bin/zsh`.

Now you'll want to configure the theme and plugins, so follow these two guides:

* [Chose and install](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes) a theme, I really like Avit.
* [Browse the plugins](https://github.com/robbyrussell/oh-my-zsh/wiki/Plugins) and add the ones you like, I currently have: git, rails, ruby, brew, common-aliases, gem, npm, pip, python, rvm and sublime.

## Step 6
Install the [Mac Github app](https://mac.github.com/), it's surprisingly worse than the Windows version though. It doesn't feel as polished and powerful basically.

## Step 7
I installed some other apps as well, although not essential:

* [Transmission](https://www.transmissionbt.com/): Torrent client
* [Transmit](http://panic.com/transmit/): FTP client (not free though, but worth it)
* [Skim](http://skim-app.sourceforge.net/): Better pdf reader, interacts very well with LaTeXTools.
* [Caffeine](http://lightheadsw.com/caffeine/): Allows the Mac to stay awake while doing work, loving the play on words.
* Memory Clean, Flux, Spotify, Photoshop, Final Cut Pro, Office for Mac, Skype, App Cleaner...

Done for now!
