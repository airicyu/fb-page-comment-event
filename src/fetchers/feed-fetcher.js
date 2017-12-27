'use strict';

/* Util for fetcher new feed items */

const stateStoreHolder = require('./../store/state-store-holder');
const loggerHolder = require('./../utils/logger-holder');

const getFeedFetcher = function (queryFeedAgent) {
    let fetcher = {
        queryFeedAgent,
        fetch: null
    };

    fetcher.fetch = async function (pageId, since) {
        let self = this;
        let pageFeedLastScannedCommentTime = await stateStoreHolder.getStore().getPageFeedLastScannedCommentTime(pageId) || 1;
        since = since || pageFeedLastScannedCommentTime;

        loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetching feed items with comments newer than (since=${since}, time=${new Date(since*1000).toISOString()}).`);

        let result = await self.queryFeedAgent.query(pageId, since);
        let newItems = [];

        let needUpdate = false;

        let feeds = result.data;
        if (feeds && feeds.length) {
            newItems = feeds.filter(_ => _.comments && _.comments.data.length > 0);
        }

        if (newItems && newItems.length) {
            let newestCommentCreateTime = Math.max(...newItems.map(feed => {
                let commentCreateTimes = feed.comments.data.map(comment => new Date(comment['created_time']).getTime());
                return Math.max(...commentCreateTimes);
            }));

            let newPageFeedLastScannedCommentTime = Math.trunc(newestCommentCreateTime / 1000) + 1;
            await stateStoreHolder.getStore().setPageFeedLastScannedCommentTime(pageId, newPageFeedLastScannedCommentTime);
            loggerHolder.getLogger().debug(new Date().toISOString() + ': ' + `Fetched and filtered and returning ${newItems.length} feed items which containing new comments. "newPageFeedLastScannedCommentTime" reset to ${new Date(newPageFeedLastScannedCommentTime*1000).toISOString()}.`);
        }

        return newItems;
    }

    return fetcher;
}


module.exports = getFeedFetcher;