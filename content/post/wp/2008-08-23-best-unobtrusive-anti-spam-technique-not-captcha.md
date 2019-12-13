---
author: Alex
categories:
- CSS
- Main
date: "2008-08-23T00:00:00Z"
tags:
- anti
- captcha
- prevent
- spam
- thomas landauer
thumbnail: /assets/files/thumbnails/captcha.png
title: Best unobtrusive anti-spam technique (Not CAPTCHA)
url: /blog/2008/08/23/best-unobtrusive-anti-spam-technique-not-captcha/
---

I know you are probably thinking that this will be some silly thing, but this idea that [Thomas Landauer][1] came up with is by far the best I\'ve seen in a long time.

 [1]: http://www.landauer.at/preventing-spam-in-form-submissions-without-using-a-captcha.php

## How does it work?

Well the idea is relatively simple: Add CSS-hidden fields that a user won\'t see, but a spam-bot will fill. Then using php check if they were filled, and if they were: block the spammer!

The CSS would be something as simple as:

{{< highlight css "linenos=table" >}}
.noshow { display:none; }
{{< / highlight >}}

The HTML form should include something like this:

{{< highlight html "linenos=table" >}}
<label for="leaveblank">Leave this blank</label>
<input type="text" class="noshow" id="leaveblank" name="leaveblank" /><br />
<label for="dontchange">Do not change this</label>
<input type="text" value="http://" class="noshow" id="dontchange" name="dontchange" />
{{< / highlight >}}     
    

And finally the php would be simply:

{{< highlight php "linenos=table,startinline" >}}
if ($_POST['leaveblank'] == '' &#038;&#038; $_POST['dontchange'] == 'http://') {
 // accept form submission
}
{{< / highlight >}}   

The only possible drawback would be that some users with CSS disabled would see the \"hidden\" form fields, and thus would be quite puzzled.  
The good thing is that the percentage of users with CSS disabled is so low that I wouldn\'t even care about that issue...

I like this idea so much that I\'m writing a WP plugin to do this for sure. Just wait for a week or so and I will have version one running!