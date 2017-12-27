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