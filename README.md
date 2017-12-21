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

This module would run a schedule job to track your Facebook page Posts' comment events.

What it would do is periodically call Facebook Graph API to track your Facebook page recent feed updates. It would check whether there are new comment in your Facebook page. If it find new comments from these posts, it would generate events and trigger your custom callback function.

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
    console.log(JSON.stringify(events, null, 2));
});
```

* Remarks: `PageId` is the facebook page ID. `accessToken` is the Facebook page access token(remember to use the long live token) which Facebook page owner can generate in developer dashboard.


Sample console log output:

```
>node sample.js
{"message":"2017-12-21T19:18:48.701Z: Fetching feed items with comments newer than lastScannedCommentTime(2017-12-21T19:14:18.000Z).","level":"info"}
{"message":"2017-12-21T19:18:48.960Z: Fetched and filtered and returning 1 feed items which containing new comments. \"newLastScannedCommentTime\" reset to 2017-12-21T19:14:18.000Z.","level":"info"}
[
  {
    "eventType": "comment",
    "data": {
      "postId": "xxxxxx",
      "commentId": "yyyyyy",
      "from": {
        "name": "zzzzzz",
        "id": "aaaaaa"
      },
      "commentCreateTime": 1513883658000,
      "message": "test comment",
      "link": "https://www.facebook.com/permalink.php?story_fbid=xxxxxx&id=aaaaaa&comment_id=cccccc"
    }
  }
]
```

------------------------
## Author

- Eric Yu: airic.yu@gmail.com