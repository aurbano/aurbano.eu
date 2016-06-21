---
layout: post
title: "Generating Pixel Perfect PDF Reports"
tagline: "Without having to trade your soul in the process"
description: "No but really, does anyone actually get excited about pretty pdf reports?"
categories:
  - Main
tags:
  - report
  - pdf
  - reporting
---
{% include JB/setup %}

Have you been tasked with generating PDF reports? If you have tried using the typical tools (iText for Java, ReportLab in Python... ) you understand why it's bad.

Imagine having to build a PDF like this:

```java
Rectangle pagesize = new Rectangle(216f, 720f);
Document document = new Document(pagesize, 36f, 72f, 108f, 180f);
// step 2
PdfWriter.getInstance(document, new FileOutputStream(RESULT));
// step 3
document.open();
// step 4
document.add(new Paragraph(
    "Hello World! Hello People! " +
    "Hello Sky! Hello Sun! Hello Moon! Hello Stars!"));
// step 5
document.close();
```

Now add images, charts... and get ready to quit your job and become a farmer.

HTML/CSS can have many downsides, but the reality is that they are one of the easiest ways to *programatically generate* a document with any design we could think of.

So I thought that if I wanted our reports to follow the branding of our web application, we should be **rendering HTML/CSS** to a **PDF**.

This will even allow you to generate the PDF reports using your existing code, be it Angular/React... etc.

## Enter PhantomJS

**Quick intro:** PhantomJS is a *"headless"* browser, that can render a web page just like Chrome, from the command line. And it can output the website as an image or pdf.

**Benefits:** You can actually run this from Java, NodeJS, Python, or whichever language that allows you to call an executable. In fact from NodeJS it would be even easier since PhantomJS runs in Node.

Since I did this for a reporting system at work, that was built in Java, I'll focus on that.

You'll need three things to generate a report:

1. PhantomJS executable
1. JavaScript config file for PhantomJS
1. HTML file to convert into PDF


### JavaScript config file for PhantomJS

The following file will configure PhantomJS to generate a standard A4 PDF, in portrait mode.

It will take the HTML content and the PDF output file from the CLI arguments.

```js
var page = require('webpage').create(),
    system = require('system'),
    fs = require('fs');

page.settings.userAgent = "aurbano";
// The following are only required if you're loading assets using file://
page.settings.localToRemoteUrlAccessEnabled = true;
page.settings.webSecurityEnabled = false;
page.settings.loadImages = true;

page.paperSize = {
    format: 'A4',
    orientation: 'portrait',
    margin: {
        top: "1.5cm",
        bottom: "1cm"
    },
    footer: {
        height: "1cm",
        contents: phantom.callback(function (pageNum, numPages) {
            return '' +
                '<div style="margin: 0 1cm 0 1cm; font-size: 0.65em">' +
                '   <div style="color: #888; padding:20px 20px 0 10px; border-top: 1px solid #ccc;">' +
                '       <span>REPORT FOOTER</span> ' +
                '       <span style="float:right">' + pageNum + ' / ' + numPages + '</span>' +
                '   </div>' +
                '</div>';
        })
    }
};

// This will fix some things that I'll talk about in a second
page.settings.dpi = "96";

page.content = fs.read(system.args[1]);

var output = system.args[2];

window.setTimeout(function () {
    page.render(output, {format: 'pdf'});
    phantom.exit(0);
}, 2000);
```

### HTML File

Any file, with any contents will work just fine. To load local resources you can just use the `file://` protocol.

```html
<!DOCTYPE html>

<html lang="en">
<head>
    <title>The title is irrelevant</title>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" media="all" type="text/css" href="file:///path/to/stylesheet.css" />

    <style type="text/css" media="all">
        html {
            margin:0;
            zoom: 1; /* or 0.76 for Linux */
        }
    </style>
</head>

<body>
  <h1>Sample report</h1>
  <p>It works!</p>
</div>
</body>
</html>
```

## Executing

If running this from the command line, just make sure you have NodeJS and PhantomJS installed (duh... ), then run:

```sh
$ phantomjs configFile.js htmlFile.html output.pdf
```

If you wanted to run this programatically from Java for example, you could use:

```java
// Get HTML Report
URL htmlFileUrl = this.getClass().getResource("htmlFile.html");
File htmlFile = Paths.get(htmlFileUrl.toURI()).toFile();

// Get JS config file
URL configFileUrl = this.getClass().getResource("configFile.js");
File configFile = Paths.get(configFileUrl.toURI()).toFile();

// tmp pdf file for output
File pdfReport = File.createTempFile("report", ".pdf");

ProcessBuilder renderProcess = new ProcessBuilder(
        "/path/to/phantomjs",
        configFile.getAbsolutePath(),
        htmlFile.getAbsolutePath(),
        pdfReport.getAbsolutePath()
);

Process phantom = renderProcess.start();

// you need to read phantom.getInputStream() and phantom.getErrorStream()
// otherwise if they output something the process won't end

int exitCode = phantom.waitFor();

if(exitCode != 0){
    // report generation failed
}

// success!
```

The coolest thing? If you can render it in HTML, you can render it in your report! 

This means that now you can almost directly copy/paste from your application, you can even use AngularJS/React to generate the content... The possibilities are endless.

## Caveats
As of versions <= 2.1 PhantomJS renders differenly on Windows and Linux. I believe this is caused by different DPI settings.

After **hours** of debugging and trying to figure out ways to fix it, I decided to use a CSS transform to adjust for the difference, you can find it commented in the HTML file. The magic number is **0.76**, if you find a better solution please let me know!


