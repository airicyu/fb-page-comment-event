'use strict';

/* Util for fetcher new notification items */

const stateStoreHolder = require('./../store/state-store-holder');
const loggerHolder = require('./logger-holder');

const getNotificationFetcher = function(queryNotificationAgent){
    let fetcher = {
        queryNotificationAgent,
        fetch: null
    };
       
    fetcher.fetch = async function () {
        let self = this;
        let lastCheckedItemUpdateTime = await stateStoreHolder.getStore().getLastNotificationUpdateTime() || 0;
    
        loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetching new notification items which newer than lastCheckedItemUpdateTime(${new Date(lastCheckedItemUpdateTime).toISOString()}).`);

        let isAfterLastCheckedUpdateTime = function (lastCheckedItemUpdateTime, item){
            return (item['updated_time'] && new Date(item['updated_time']).getTime() > lastCheckedItemUpdateTime);
        }.bind(undefined, lastCheckedItemUpdateTime);

        let result = await self.queryNotificationAgent.query();
        let newItems = [];
    
        let needUpdate = false;
        let isFetchMore = false;
    
        let notifications = result.data;
        if (notifications && notifications.length) {
            let latestNotification = notifications[0];
            if (isAfterLastCheckedUpdateTime(latestNotification)) {
                needUpdate = true;
            }
        } else {
            return;
        }
    
        if (needUpdate) {
            newItems.push(...notifications.filter(isAfterLastCheckedUpdateTime));
    
            //check whether need to further check next page of notifications.
            if (isAfterLastCheckedUpdateTime(notifications[notifications.length - 1])) {
                isFetchMore = true
            }
    
            //loop to fetch more notifications to check events.
            let currentResult = result;
            while (isFetchMore) {
                isFetchMore = false;
                if (currentResult.paging && currentResult.paging.next) {
                    currentResult = await self.queryNotificationAgent.queryNext(currentResult.paging.next);
                    let notifications = currentResult.data;
                    if (notifications && notifications.length) {
                        newItems.push(...notifications.filter(isAfterLastCheckedUpdateTime));
    
                        if (isAfterLastCheckedUpdateTime(notifications[notifications.length - 1])) {
                            isFetchMore = true
                        }
                    }
                }
            }
        }
        
        let newLastCheckedItemUpdateTime = new Date(notifications[0]['updated_time']).getTime()
        await stateStoreHolder.getStore().setLastNotificationUpdateTime(newLastCheckedItemUpdateTime);
        loggerHolder.getLogger().info(new Date().toISOString() + ': ' + `Fetched ${newItems.length} new notification items. "newLastCheckedItemUpdateTime" reset to ${new Date(newLastCheckedItemUpdateTime).toISOString()}.`);
        return newItems;
    }
    
    return fetcher;
}


module.exports = getNotificationFetcher;