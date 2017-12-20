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

This module would run a schedule job to track your Facebook page Posts' comment/reply events.

What it would do is periodically call Facebook Graph API to track your Facebook page notification updates. It would check whether there are new comment or reply in your Facebook page. If it find new comment/reply events, it will call your custom callback function.

------------------------

## Samples

### Starting the event engine:

```javascript
'use strict';

const fbPageCommentEventApp = require('fb-page-comment-event')({
    pageId : 'xxxxxx',
    accessToken : 'yyyyyy'
});

fbPageCommentEventApp.run((events)=>{
    console.log(events);
});
```

* Remarks: `PageId` is the facebook page ID. `accessToken` is a Facebook page access token which Facebook page owner can generate in developer dashboard.


Sample console log output:

```
>node sample.js
{"message":"2017-12-20T18:32:10.821Z: Fetching new notification items which newer than lastCheckedItemUpdateTime(2017-12-20T18:32:10.777Z).","level":"info"}
{"message":"2017-12-20T18:32:11.112Z: Fetched 0 new notification items. \"newLastCheckedItemUpdateTime\" reset to 2017-12-20T17:43:09.000Z.","level":"info"}
{"message":"2017-12-20T18:32:41.113Z: Fetching new notification items which newer than lastCheckedItemUpdateTime(2017-12-20T17:43:09.000Z).","level":"info"}
{"message":"2017-12-20T18:32:41.383Z: Fetched 2 new notification items. \"newLastCheckedItemUpdateTime\" reset to 2017-12-20T18:32:31.000Z.","level":"info"}
[ { eventType: 'reply_comment',
    postId: 'xxxxxx',
    commentId: 'yyyyyy',
    replyCommentId: 'zzzzzz',
    link: 'http://www.facebook.com/permalink.php?story_fbid=xxxxxx&id=aaaaaa&comment_id=cccccc&reply_comment_id=dddddd' },
  { eventType: 'comment',
    postId: 'xxxxxx',
    commentId: 'yyyyyy',
    link: 'http://www.facebook.com/permalink.php?story_fbid=xxxxxx&id=aaaaaa&comment_id=cccccc' } ]
```

------------------------
## Author

- Eric Yu: airic.yu@gmail.com