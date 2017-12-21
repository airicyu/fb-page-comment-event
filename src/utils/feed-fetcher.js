'use strict';

/* Util for fetcher new feed items */

const stateStoreHolder = require('./../store/state-store-holder');
const loggerHolder = require('./logger-holder');

const getNotificationFetcher = function (queryFeedAgent) {
    let fetcher = {
        queryFeedAgent,
        fetch: null
    };

    fetcher.fetch = async function () {
        let self = this;
        let lastScannedCommentTime = await stateStoreHolder.getStore().getLastScannedCommentTime() || 0;

        loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetching feed items with comments newer than lastScannedCommentTime(${new Date(lastScannedCommentTime*1000).toISOString()}).`);

        let result = await self.queryFeedAgent.query(lastScannedCommentTime);
        let newItems = [];

        let needUpdate = false;

        let feeds = result.data;
        if (feeds && feeds.length) {
            newItems = feeds.filter(_ => _.comments && _.comments.data.length > 0);
        }

        if (newItems && newItems.length){
            let newestCommentCreateTime = Math.max(...newItems.map(feed => {
                let commentCreateTimes = feed.comments.data.map(comment => new Date(comment['created_time']).getTime());
                return Math.max(...commentCreateTimes);
            }));
    
            let newLastScannedCommentTime = Math.ceil(newestCommentCreateTime/1000);
            await stateStoreHolder.getStore().setLastScannedCommentTime(newLastScannedCommentTime);
            loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetched and filtered and returning ${newItems.length} feed items which containing new comments. "newLastScannedCommentTime" reset to ${new Date(newLastScannedCommentTime*1000).toISOString()}.`);
        } else {
            loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetched and filtered and no feeds having new comments.`);
        }
        
        return newItems;
    }

    return fetcher;
}


module.exports = getNotificationFetcher;