'use strict';

/* Digestor for digesting posts into events */

const getPostDigestor = function () {
    let postDigestor = {
        digest: null
    };

    postDigestor.digest = async function (posts) {
        let events = [];
        posts.forEach((post) => {
            let id = post.id;
            let pageId = post.id.split('_')[0];
            let postId = post.id.split('_')[1];

            let comments = post.comments.data;
            comments.forEach((comment) => {
                let commentId = comment.id.split('_')[1];
                let commentCreateTime = new Date(comment['created_time']).getTime();
                let from = comment.from;
                let link = comment.permalink_url;
                let message = comment.message;
                if (message.length > 100) {
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
    }.bind(postDigestor);

    return postDigestor;
}

module.exports = getPostDigestor;