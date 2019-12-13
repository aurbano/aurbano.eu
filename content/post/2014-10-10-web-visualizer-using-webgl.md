---
categories:
- JavaScript
- Main
date: "2014-10-10T00:00:00Z"
description: Building a web visualization tool using some search APIs and VivaGraphJS
  WebGL renderer
tagline: VivaGraphJS library
tags:
- javascript
- webgl
- vivagraphjs
thumbnail: /assets/files/thumbnails/webvisualizer.PNG
title: Web Visualizer using WebGL
---
{% include JB/setup %}

I decided to build a tool that would allow me to see how websites are related in a visual way. I'm still working on the concept but the tool is ready and working: [WebVisualizer](http://web-visualizer.urbanoalvarez.es).

##Building blocks
In order to get this to work there were some basic building blocks I needed. Some server side and a few client side. Here is a little run through:

###Client graph rendering
I had some experience with the [VivaGraph](https://github.com/anvaka/VivaGraphJS) library, from the very talented [Andrei Kashcha](http://www.yasiv.com/), so that was an obvious choice. It allows you to render very large graphs (tested up to 50000+) using WebGL without any hassle really.

Using WebGL has some limitations, the main one is that it can **only access same domain assets** (Unless using CORS or changing the accept headers). This means we'll need a server proxy to load the favicons for each website.

###Server
I needed to setup a server, both for the image proxy and to interact with the Search APIs (they all require private keys) so I decided to go with **Nodejs** and deploy to Heroku through Travis.

For the tests I'm using [mocha](https://www.npmjs.org/package/mocha) with [should](https://www.npmjs.org/package/should) and [supertest](https://www.npmjs.org/package/supertest), they make testing a web server extremely easy.

Testing the Image proxy (detailed below):

{% gist aurbano/3d8829c5cdb243f3fded proxyTest.js %}

###Image proxy
There were some existing npm packages to proxy requests in Nodejs, but I wanted something very simple. I set it up using Express and require:

{% gist aurbano/3d8829c5cdb243f3fded expressProxy.js %}

###Search API
I was going to use the usual Google Search API, but it turns out it was deprecated some years ago and will be dissapearing. They are replacing it with the Custom Search API, which unfortunately only allows 100 queries/day.

After searching around for a bit I found that Bing offered 5000 queries/month, 5x the number Google allowed, so I went with Bing for this one...

You can sign up for Bing's Search API on the new [Azure Marketplace](https://datamarket.azure.com/dataset/bing/search), after which you go to [your profile](https://datamarket.azure.com/account/keys) in order to get your Access key.

On my code I set the Access Key as an environment variable called `bingAPIkey` in order to keep it secret. When running locally use:

`bingAPIkey=Your-Key node index.js`

> If you are deploying to Heroku as well remember to setup the Config Variable in the Settings tab.

Serving Bing searches from Nodejs was quite easy after that:

{{< highlight javascript "linenos=table" >}}
module.exports = function (app) {

	var bingAPIkey = process.env.bingAPIkey;

	if (!bingAPIkey) {
		console.error("[ERROR] No API key for Bing detected, please set the 'bingAPIkey' env variable.");
		return;
	}

	var rootUri = 'https://api.datamarket.azure.com/Bing/Search/v1',
		auth = new Buffer([bingAPIkey, bingAPIkey].join(':')).toString('base64'),
		request = require('request').defaults({
			headers: {
				'Authorization': 'Basic ' + auth
			}
		});

	// Setup the service
	app.get('/search', function (req, res) {
		var service_op = req.query.service_op || 'Web',
			query = req.query.query;

		var url = rootUri + '/' + service_op;

		console.log("Bing Search: " + url + " -> " + query);

		request.get({
			url: url,
			qs: {
				$format: 'json',
				Query: "'" + query + "'", // Single quotes required
			}
		}, function (err, response, body) {
			if (err) {
				return res.status(500).send(err.message);
			}
			if (response.statusCode !== 200) {
				return res.status(500).send(response.body);
			}

			var results = JSON.parse(response.body);
			res.send(results.d.results);
		});
	});
};
{{< / highlight >}}

##Putting it all together
After all that was working I built a simple UI to display everything, it's still a work in progress so I'll keep adding to this post.