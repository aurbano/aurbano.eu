---
title: Another Microsoft beautiful failure
author: Alex
layout: post
permalink: /blog/2008/06/12/another-microsoft-beautiful-failure/
categories:
  - General talk
---
# 

I wonder if you’ve ever encountered this, because it must be one of the most estrange errors one could possibly find…

> Your Password Must Be at Least 18770 Characters and Cannot Repeat Any of Your Previous 30689 Passwords

Apparently it only happens in Windows 2000 and in some rare cases, and there is a solution although it doesn’t really work OK…  
If you want to see it by yourself follow this steps:

1.  Install Windows 2000 (If you didn’t have it)
2.  Configure it to authenticate against an [MIT Kerberos domain][1].
3.  Log in to the MIT realm, then press CTRL ALT DELETE and select “Change password”.

 [1]: http://www.windowsecurity.com/articles/Kerberos-Authentication-Mixed-Windows-UNIX-Environment.html

Now when you try to type in a new password you will be told that it must be at least 18770 characters long, and different from 30689 combinations!

[Visit the official Microsoft Support page for this][2]

 [2]: http://support.microsoft.com/?scid=kb;en-us;276304&x=15&y=14