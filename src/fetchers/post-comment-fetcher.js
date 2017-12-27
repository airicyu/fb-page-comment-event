'use strict';

/* Util for fetcher new feed items */

const stateStoreHolder = require('./../store/state-store-holder');
const loggerHolder = require('./../utils/logger-holder');

const getPostsCommentFetcher = function (queryPostsCommentAgent) {
    let fetcher = {
        queryPostsCommentAgent,
        fetch: null
    };

    fetcher.fetch = async function (postId, since) {
        let self = this;
        let postLastScannedCommentTime = await stateStoreHolder.getStore().getPostLastScannedCommentTime(postId) || 1;
        since = since || postLastScannedCommentTime;

        loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetching post ${postId} with comments newer than (since=${since}, time=${new Date(since*1000).toISOString()}).`);

        let result = await self.queryPostsCommentAgent.query(postId, since);
        let newItems = [];

        let needUpdate = false;

        let posts = [result];
        if (posts && posts.length) {
            newItems = posts.filter(_ => _.comments && _.comments.data.length > 0);
        }

        if (newItems && newItems.length) {
            let newestCommentCreateTime = Math.max(...newItems.map(feed => {
                let commentCreateTimes = feed.comments.data.map(comment => new Date(comment['created_time']).getTime());
                return Math.max(...commentCreateTimes);
            }));

            let newPostLastScannedCommentTime = Math.trunc(newestCommentCreateTime / 1000) + 1;
            await stateStoreHolder.getStore().setPostLastScannedCommentTime(postId, newPostLastScannedCommentTime);
            loggerHolder.getLogger().debug(new Date().toISOString() + ': ' + `Fetched post ${postId} with comments and filtered and returning ${newItems.length} post items which containing new comments. "postLastScannedCommentTime" reset to ${new Date(newPostLastScannedCommentTime*1000).toISOString()}.`);
        }

        return newItems;
    }

    return fetcher;
}


module.exports = getPostsCommentFetcher;