'use strict';

/* Digestor for digesting feed into events */

const getFeedDigestor = function () {
    let feedDigestor = {
        digest: null
    };

    feedDigestor.digest = async function (feeds) {
        let events = [];
        feeds.forEach((feed)=>{
            let id = feed.id;
            let pageId = feed.id.split('_')[0] || null;
            let postId = feed.id.split('_')[1] || null;
            
            let comments = feed.comments.data;
            comments.forEach((comment)=>{
                let commentId = comment.id.split('_')[1] || null;
                let commentCreateTime = new Date(comment['created_time']).getTime();
                let from = comment.from;
                let link = comment.permalink_url;
                let message = comment.message;
                if (message.length>100) {
                    message = message.substr(0, 100) + '...';
                }
                events.push({
                    eventType: 'comment',
                    data: {
                        pageId,
                        postId,
                        commentId,
                        from,
                        commentCreateTime,
                        message,
                        link,
                    }
                });
            })
        });
        return events;
    }.bind(feedDigestor);

    return feedDigestor;
}

module.exports = getFeedDigestor;