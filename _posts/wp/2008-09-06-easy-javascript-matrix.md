---
title: Easy JavaScript Matrix
author: Alex
layout: post
permalink: /blog/2008/09/06/easy-javascript-matrix/
categories:
  - Javascript
  - Programming
tags:
  - hacker
  - javascript
  - matrix
---
# 

![JavaScript Matrix][1]A very cool way to display stuff on a website, is using a Matrix style. It is also quite common amongst hackers, and most of the people who have hacked a site for the sole purpose of proving they can like to display their hacker name in the index file, sometimes using JavaScript matrix style.

 [1]: http://urbanoalvarez.es/img/blog/js_matrix.gif

*   [View sample page][2]

 [2]: http://urbanoalvarez.es/js_matrix/

Well, here a way to do it:

All you have to do is copy and paste the following javascript code into your website:

    var rows=21;
    var speed=3;
    var reveal=3;
    var effectalign="default";
    
    var w3c=document.getElementById &#038;&#038; !window.opera;;
    var ie45=document.all &#038;&#038; !window.opera;
    var ma_tab, matemp, ma_bod, ma_row, x, y, columns, ma_txt, ma_cho;
    var m_coch=new Array();
    var m_copo=new Array();
    window.onload=function() {
       if (!w3c &#038;&#038; !ie45) return
      var matrix=(w3c)?document.getElementById("matrix"):document.all["matrix"];
      ma_txt=(w3c)?matrix.firstChild.nodeValue:matrix.innerHTML;
      ma_txt=" " ma_txt " ";
      columns=ma_txt.length;
      if (w3c) {
        while (matrix.childNodes.length) matrix.removeChild(matrix.childNodes[0]);
        ma_tab=document.createElement("table");
        ma_tab.setAttribute("border", 0);
        ma_tab.setAttribute("align", effectalign);
        ma_tab.style.backgroundColor="#000000";
        ma_bod=document.createElement("tbody");
        for (x=0; x