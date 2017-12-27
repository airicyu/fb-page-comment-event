'use strict';

/* Store for last checked status metadata in memory */

const _store = {};
_store['pageFeedLastScannedCommentTime'] = {};
_store['postLastScannedCommentTime'] = {};

const store = {
    getPageFeedLastScannedCommentTime: null,
    setPageFeedLastScannedCommentTime: null,
    getPostLastScannedCommentTime: null,
    setPostLastScannedCommentTime: null
};

store.getPageFeedLastScannedCommentTime = async function (pageId) {
    return _store['pageFeedLastScannedCommentTime'][pageId];
};

store.setPageFeedLastScannedCommentTime = async function (pageId, value) {
    if (value !== null) {
        _store['pageFeedLastScannedCommentTime'][pageId] = value;
    } else {
        delete _store['pageFeedLastScannedCommentTime'][pageId];
    }
    return;
};

store.getPostLastScannedCommentTime = async function (postId) {
    return _store['postLastScannedCommentTime'][postId];
};

store.setPostLastScannedCommentTime = async function (postId, value) {
    if (value !== null) {
        _store['postLastScannedCommentTime'][postId] = value;
    } else {
        delete _store['postLastScannedCommentTime'][postId];
    }
    return;
};

module.exports = store;