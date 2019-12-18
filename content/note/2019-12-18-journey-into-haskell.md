---
categories:
- Main
date: "2019-12-18T00:00:00Z"
description: Do I need Haskell to be a functional human?
tags:
- thoughts
title: Journey into Haskell
---

I just came across a great read called ["The one time I thought I understood recursion"](https://functional.christmas/2019/18), which talked about a developer's first steps with Haskell.

He's doing the classic "find the n-th prime" algorithm, that has a typical recursive solution. It includes a snippet that solves the problem in a way that's just as beautiful as it is impossible to understand for me right now, without any Haskell knowledge.

So I've decided to (finally) start my Journey into Haskell by understanding how that snippet works. Please note that I know **nothing** of Haskell as of now! So I'm going to be learning as I go through the snippet.

> Every thing written here may be (and very likely is) wrong!

```haskell
nth :: Integral a => Int -> Maybe a
nth 0 = Nothing
nth x = Just (last $ primes x)

primes :: Integral a => Int -> [a]
primes n = take n $ sieve [2..]
    where sieve (p:xs) = p : sieve [x | x <- xs, x `rem` p > 0]
          sieve [] = []
```

I'll start by trying to understand what each line does:

```haskell
nth :: Integral a => Int -> Maybe a
```

At a glance `::` seems to be declaring a variable, which will be a function that takes an `Int`, and maybe? returns an `Int`. The maybe seems to be similar to Java's Optional. But why the `Integral a` then?

[Reading up on it](http://learnyouahaskell.com/syntax-in-functions) this turns out to be way more interesting than I thought! `Integral a` is the argument to the function, followed by a list of potential return types. This means that in some cases the function will return an Int (the nth prime), and in other cases it **might** return the same as the input.

```haskell
nth 0 = Nothing
```

Seems easy, when calling `nth` with `0` as the argument, we return `Nothing`. From the [docs](https://hackage.haskell.org/package/base-4.12.0.0/docs/Data-Maybe.html#v:Nothing) and [SO](https://stackoverflow.com/questions/22065358/what-is-the-type-of-nothing-in-haskell), `Nothing` represents a lack of value for a `Maybe XXX` type. Hence the `Maybe a` above.

```haskell
nth x = Just (last $ primes x)
```

After [a bit of help from SO](https://stackoverflow.com/questions/18808258/what-does-the-just-syntax-mean-in-haskell), I think I get it: For any other argument `x`, `Just` is a constructor for `Maybe` which "asserts" that x does have a value (or that the function on its right will not return `Nothing`, I'm not fully sure now), then runs the functions in the parenthesis.

`last` is obvious, it returns the last element on a list.
`$` is not so much. It required some [additional reading](https://typeclasses.com/featured/dollar) to understand that it's essentially sugar for more parenthesis, so AFAIK, the following two lines would do the same:

```haskell
nth x = Just (last $ primes x)
nth x = Just (last (primes x))
```

The article goes to pretty scary deep places regarding the use of the `$` sign, but I'm gonna leave that for future me :) For now I get what it's doing in this context and that's going to be enough.

The last thing is to call the function `primes` with the argument `x`, which seems to be defined later on (Apparently because Haskell does lazy evaluation you can define functions in any order). I assume that `primes` will be a function that takes one integer and returns a list of integers (primes) up to that one.

```haskell
primes :: Integral a => Int -> [a]
```

The type definition for `primes` confirms the assumption, let's move on to the body (I'll show it complete first, then break it down by lines)

```haskell
primes n = take n $ sieve [2..]
    where sieve (p:xs) = p : sieve [x | x <- xs, x `rem` p > 0]
          sieve [] = []
```

Time to roll my sleeves up, this looks like a mess! Where do I start...?

```haskell
primes n = take n $ sieve [2..]
```

So `primes` is a function with one argument `n`, that returns `take n $ sieve [2..]`. Let's see what that does:

`take` is a built-in function that takes two arguments, an integer (N) and a list, and returns the first N elements of the list (or less if the list is not long enough).

It's being called with `n` (the argument from `primes`, which was actually the nth integer from the start), and `$ sieve [2..]` which as I have learnt should become the return value of `sieve [2..]`.

I'm still not sure whether `sieve` is built-in or defined below where it says `where sieve (p:xs) =`, so I'll finish this line first. `[]` is an operator that creates a list (or maybe I should call it sugar for the List constructor?) and `2..` means all integers starting from 2. Ok, getting there!

Now we move on to the definition of `sieve`:

```haskell
where sieve (p:xs) = p : sieve [x | x <- xs, x `rem` p > 0]
```

`where` is a way to define functions based on their inputs, quite similar to what happened earlier, and after reading [some documentation](https://wiki.haskell.org/Let_vs._Where) I'm still not 100% sure about when it's best to be used, but I think I get what it does.

Something awesome that I'm realising now is the "[lazy evaluation](https://wiki.haskell.org/Lazy_evaluation)" part of Haskell. If you wrote this code in Java for example it would simply never end because we're calling sieve with an infinite list! But thanks to Haskell's lazy evaluation `sieve [2..]` doesn't get evaluated when defined, but when it's return value is needed. So because `take n` needs the first `n` elements of the list returned by `sieve [2..]`, it will only evaluate until then. I'm blown away!

The next bit that looks odd is `p:xs`, my guess is that this represents an argument of type list, where the start is stored in `p` and the end in `xs`? but the list was unbounded (defined as `2..`) so surely I'm missing something here (I was, I figured it out by the next paragraph). Time to [read](https://wiki.haskell.org/How_to_read_Haskell).

Ok, it turns out that `p:xs` is a fairly standard convention, although the typical way of writing it is `x:xs`. In Haskell it's common to end list variables with an `s`, and use a single letter for single values. The fact that they chose `p` instead of `x` is an indication that it's value is special - it's a prime number (well, it should be).

After reading [some more](http://learnyouahaskell.com/syntax-in-functions), I understand that `p:xs` is a pattern (and [patterns look AWESOME](https://www.haskell.org/tutorial/patterns.html) in Haskell!), which means that `p` is the first element, and `xs` is **the rest** of the list. For example if you needed the first two elements and then the rest, you could write `p:s:xs`, where `p` would be the first, `s` the second, and `xs` the rest.

For example the first time `sieve` runs `p = 2` and `xs = [3, 4, 5...]`.

Now the return of the function: ``p : sieve [x | x <- xs, x `rem` p > 0]``.

Based on what I've learned so far, this is defining a new pattern that starts with `p` and ends in the return value of ``sieve [x | x <- xs, x `rem` p > 0]``, which should end up being a list of primes in `xs`.

The argument for the recursive call to `sieve`: ``x | x <- xs, x `rem` p > 0`` is what's called list comprehension, or in other words, get a subset of the original list where each element satisfies some conditions. The syntax seems to be `{return_var} | {return_var} from {list}, {condition 1}[, {condition 2}, ...]`.

So in this case it says "list of all `x` from `xs` such that ``x `rem` p > 0``. And without reading up on this, I'm assuming this says where the remainder of dividing `x`by `p` is greater than 0? (Yes, [that's it](http://zvon.org/other/haskell/Outputprelude/rem_f.html))

And the last line:

```haskell
sieve [] = []
```

It simply returns an empty list when `sieve` is called with an empty list.

### Recap

Ok so now that I (mostly) get the syntax it's time to have a look at the algorithm again and see if I can make sense of it.

```haskell
nth :: Integral a => Int -> Maybe a
nth 0 = Nothing
nth x = Just (last $ primes x)

primes :: Integral a => Int -> [a]
primes n = take n $ sieve [2..]
    where sieve (p:xs) = p : sieve [x | x <- xs, x `rem` p > 0]
          sieve [] = []
```

Our `nth` function returns the largest prime lower or equals to an integer we pass.

If we pass 0, we get nothing.

If we pass any other number, we'll first calculate all primes up until that number and then return the last one.

In order to calculate all primes until that number, we'll start with a list of all integers starting by 2, and return a subset of the list starting from the next integer that is not divisible by it.

So if we call the function with 14, we'd expect the output to be 13. Let's run through what happens:

```
sieve [2..]

// ------- //

return = [2]
p = 2
xs = [3..]

// ------- //

return = [2, 3]
p = 3
xs = [5, 7, 11, 13]

// ------- //

return = [2, 3, 5]
p = 5
xs = [7, 11, 13]

// ------- //

return = [2, 3, 5, 7]
p = 7
xs = [11, 13]

// ------- //

return = [2, 3, 5, 7]
p = 7
xs = [11, 13]

// ------- //

return = [2, 3, 5, 7, 11]
p = 13
xs = [] // this list would probably have some elements, but they are no longer important

return = [2, 3, 5, 7, 11, 13]

Take the last element:

Return 13
```

This was pretty cool! I'm now going to set up Haskell locally to start writing some code myself, so hopefully my Journey continues and I can post Part 2 at some point!
