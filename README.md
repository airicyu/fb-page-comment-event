# fb-page-comment-event

[![npm version](https://img.shields.io/npm/v/fb-page-comment-event.svg)](https://www.npmjs.com/package/fb-page-comment-event)
[![node](https://img.shields.io/node/v/fb-page-comment-event.svg)](https://www.npmjs.com/package/fb-page-comment-event)
[![Codecov branch](https://img.shields.io/codecov/c/github/airicyu/fb-page-comment-event/master.svg)](https://codecov.io/gh/airicyu/fb-page-comment-event)
[![Build](https://travis-ci.org/airicyu/fb-page-comment-event.svg?branch=master)](https://travis-ci.org/airicyu/fb-page-comment-event)

[![dependencies Status](https://david-dm.org/airicyu/fb-page-comment-event/status.svg)](https://david-dm.org/airicyu/fb-page-comment-event)
[![devDependencies Status](https://david-dm.org/airicyu/fb-page-comment-event/dev-status.svg)](https://david-dm.org/airicyu/fb-page-comment-event?type=dev)

## Project Page
- [My Blog](http://blog.airic-yu.com/2286/fb-page-comment-event)
- [Github](https://github.com/airicyu/fb-page-comment-event)
- [NPM](https://www.npmjs.com/package/fb-page-comment-event)

------------------------

## Description

This module can keep track your Facebook page posts' first level comment events. Hence, if someone commented on your post, you will be notified by an event.

This module support running an event-engine which would manage a background schedule job to check new comment and generating events.
This module also support raw APIs which you can check new comments and digest as events by yourself via APIs.

------------------------

## Running the event engine

You may use the `lib.pageCommentEventApp(options)` API to get a event engine app and then start it with `run` function. This event engine app would manage a schedule job to auto pull data.

Sample:

```javascript
'use strict';

let fbPageCommentEventLib = require('fb-page-comment-event');

const pageCommentEventApp = fbPageCommentEventLib.pageCommentEventApp({
    accessToken: 'EAASHAlSbbMUBALwwZCxZB1T7eDvFZBR......GQfNPb5Bxo5b2wdzMb45gJxcdZAFOQZDZD',
    pullInterval: 15 * 1000
});

pageCommentEventApp.registerMonitorPost({ pageId: 'xxxxx', postId: 'yyyyy' });

pageCommentEventApp.run((events) => {
    console.log(JSON.stringify(events, null, 2));
    return;
});
```

* Remarks: `pageId` is the facebook page ID. `postId` is the facebook page post ID of post which you want to monitor its comment. `accessToken` is the Facebook page access token(remember to use the long live token) which Facebook page owner can generate in developer dashboard.


Sample console log output:

```
>node sample.js
{"message":"2017-12-21T19:18:48.701Z: Fetching post xxxxx_yyyyy with comments newer than (since=1514403141, time=2017-12-27T19:32:21.000Z).","level":"info"}
{"message":"2017-12-21T19:18:48.960Z: Fetched post xxxxx_yyyyy and filtered and returning 1 feed items which containing new comments. \"newLastScannedCommentTime\" reset to 2017-12-21T19:14:18.000Z.","level":"info"} 
[{
		"eventType": "comment",
		"data": {
			"pageId": "xxxxx",
			"postId": "yyyyy",
			"commentId": "zzzzz",
			"from": {
				"name": "John Chan",
				"id": "bbb"
			},
			"commentCreateTime": 1513883658000,
			"message": "test comment",
			"link": "https://www.facebook.com/permalink.php?story_fbid=yyyyy&id=xxxxx&comment_id=zzzzz"
		}
	}
]
```
------------------------

## (DIY) Use the APIs to check new comments and generating events

Sample:

```javascript
let fbPageCommentEventLib = require('fb-page-comment-event');

let pageId = 'aaa';
let postId = 'bbb';
let accessToken = 'XXX...ZZZ';

let postDigestor = lib.api.getPostDigestor();

let since = Math.trunc(Date.now() / 1000) - 10 * 60; //since 10 minutes before

(async function () {

    let queryPostCommentAgent = lib.api.getQueryPostCommentAgent({ accessToken }); //initialize query agent with access token
    let postCommentFetcher = lib.api.getPostCommentFetcher(queryPostCommentAgent); //initial comment fetcher

    let postWithNewComments = await postCommentFetcher.fetch(`${pageId}_${postId}`, since); //fetch target post with new comments
    let postWithNewCommentEvents = await postDigestor.digest(postWithNewComments); //digest the post object into new comment events

    console.log(`postWithNewCommentEvents: ${JSON.stringify(postWithNewCommentEvents, null, 2)}`);
})();

```

------------------------

## event engine APIs

### let app = lib.pageCommentEventApp({accessToken, pullInterval})

Description:

Initializing the event engine app.

parameters:

- accessToken: The required accessToken(need permission `manage_pages`) for the API calls.
- pullInterval: The sleep time(ms) interval between each scheduled page post new comment checking.

return:

The event engine app.

### app.registerMonitorPost({pageId, postId})

Description:

Registering a page post which the event engine would tracking for new comments

parameters:

- pageId: The page ID.
- postId: The post ID.

### app.run(eventsCallback)

Description:

Start running the event engine and register the new-comment-events callback. Once users write new comments, new-comment-events would be fired and handled by the callback.

parameters:

- eventsCallback: The batch new-comment-events handling function.

### app.stop()

Description:

Stop the event engine

------------------------

## DIY APIs

### let queryPostCommentAgent = lib.api.getQueryPostCommentAgent(options)

Description:

Initialize a agent for query post comments.

parameters:

- options: object with attribute `accessToken` which holding the required accessToken(need permission `manage_pages`) for the API calls.

return:

The agent object.

### let postCommentFetcher = lib.api.getPostCommentFetcher(queryPostCommentAgent)

Description:

Initialize a fetcher for fetching new post comment.

parameters:

- queryPostCommentAgent: The agent object which come from `lib.api.getQueryPostCommentAgent(options)`

return:

The fetcher object.

### let postCommentObj = await postCommentFetcher.fetch(postObjId, since)

Description:

Use the fetcher object to fetch post object with comments. We can use this API to get all new comments under the target post which those comments are created since the `since` time.

parameters:

- postObjId: The post object ID which is in format of `${pageId}_${postId}` in Facebook Graph API.
- since: The timestamp in second

return:

The post object with comments (All comments child objects are new comments).

### let postDigestor = lib.api.getPostDigestor();

Description:

Getting a digestor object which can turn the post-comment object from `postCommentFetcher.fetch()` result into new-comment-events.

return:

The digestor object.

### let newCommentEvents = await postDigestor.digest(postWithNewComments)

Description:

Use the digestor object to digest post-comment object into new-comment-events

parameters:

- postWithNewComments: The post object with attaching new comments.

return:

New comment event objects

------------------------

## Author

- Eric Yu: airic.yu@gmail.com