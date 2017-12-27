'use strict';

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