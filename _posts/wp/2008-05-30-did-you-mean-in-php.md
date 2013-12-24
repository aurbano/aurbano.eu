---
title: 'Did you mean&#8230; ? In php'
author: Alex
layout: post
permalink: /blog/2008/05/30/did-you-mean-in-php/
categories:
  - PHP
  - Programming
  - Reviews
tags:
  - levenshtein
  - metaphone
  - php
  - similar_text
  - soundex
  - suggestion
--- 

> This article was imported to Jekyll from my old Wordpress blog using a plugin, and it may have some errors.

In a new website I am developing for a client I had to add the usual \"Did you mean... ?\" in the search results for her. Si I started thinking for the easiest way to do this.

There are actually a lot of php functions out there to look for similar text. The most obvious one?  
[similar_text()][1]

> similar_text — Calculate the similarity between two strings

You must pass 2 parameters plus an optional third. The two first are the strings to compare, and the optional one is the percentage of \"closeness\" you want them to have. It is quite useful, although it is too expensive in terms of time to use with huge database searches, so I wouldn\'t recommend it.

[1]: http://www.php.net/manual/en/function.similar-text.php

There are two other methods that might be good for some cases, and another function that is just the best. I\'ll show you first the best way to achieve this:  
The [Levenshtein][2] algorithm, which basically finds the number of characters you must add, edit, or remove from a string to make it match another one. At first it doesn\'t sound too useful, but take a look at this example:

[2]: http://www.php.net/manual/en/function.levenshtein.php

{% highlight php linenos startinline %}
// input misspelled word
$input = 'carrrot';

// array of words to check against
$words  = array('apple','pineapple','banana','orange',
                'radish','carrot','pea','bean','potato');

// no shortest distance found, yet
$shortest = -1;

// loop through words to find the closest
foreach ($words as $word) {

    // calculate the distance between the input word,
    // and the current word
    $lev = levenshtein($input, $word);

    // check for an exact match
    if ($lev == 0) {

        // closest word is this one (exact match)
        $closest = $word;
        $shortest = 0;

        // break out of the loop; we've found an exact match
        break;
    }

    // if this distance is less than the next found shortest
    // distance, OR if a next shortest word has not yet been found
    if ($lev <= $shortest || $shortest < 0) {
        // set the closest match, and shortest distance
        $closest  = $word;
        $shortest = $lev;
    }
}
 
echo "Input word: $input\n";
if ($shortest == 0) {
    echo "Exact match found: $closest\n";
} else {
    echo "Did you mean: $closest?\n";
}
{% endhighlight %}

This is an example where even a misspelled word can be found. It uses the Levenshtein to look for the word which is the most similar one, and then it is returned.  
This is the output of the code before:


    Input word: carrrot
    Did you mean: carrot?
    

The use of this function is quite simple, although there are many optional parameters for more precise use. See the [php.net reference for this function][2]. The biggest problem is that you would have to run the algorithm against all words to get the actual one. I would only recommend it on a subset of words already narrowed down with a more generic approach.

Other algorithms that could be used for this are [soudex][3] and [metaphone][4]. [Soundex][3] will create a key that is the same for all words that are pronounced in a similar way.  
For example, the following code:

{% highlight php linenos startinline %}
echo soundex('beard');
echo soundex('bird');
echo soundex('bear');

/*
 * Output:
 * B630
 * B630
 * B600
 */
{% endhighlight  %}    

Where `beard` and `bird` are the same. <del cite="http://dev.mysql.com/doc/refman/5.0/en/string-functions.html#function_soundex">This could make suggestions fast if you have already created a column in the mysql tables with the soundex key of the tags for example, so that you could search not only for the string, but also for its soundex key...</del>
 
**UPDATE:**

You can use [MySQL\'s built in function SOUNDEX()][5] to search both for the string as-is, or for the soundex too, to provide also misspelled words.


And finally, the [metaphone][4] function, it\'s a variation of the `soundex` key that produces also a key that is the same for all words pronounced the same, but more accurately than `soundex`, since `metaphone` actually knows the rules of English pronounciation.  
The use would be exactly the same as `soundex`, and if you are going to use something of the sort I would recommend it for its improved accuracy.  
But bear in mind that both soundex and metaphone won\'t probably work fine in most other languages, or at least for languages with phonemes that don\'t exist in English.

[3]: http://www.php.net/manual/en/function.soundex.php
[4]: http://www.php.net/manual/en/function.metaphone.php
[5]: http://dev.mysql.com/doc/refman/5.0/en/string-functions.html#function_soundex