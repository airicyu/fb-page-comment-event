'use strict';

/* Digestor for digesting notification into events */

const getNotificationDigestor = function () {
    let notificationDigestor = {
        digest: null
    };

    notificationDigestor.digest = async function (notifications) {
        let events = [];
        notifications.forEach((notification)=>{
            let link = notification.link;

            //TODO non-eng

            //new comment event
            if (notification.title.indexOf(' commented on your post.') > 0) {
                let commentId = link && link.match(/&comment_id=([0-9]+)/);
                commentId = commentId && commentId[1] ;
                
                events.push({
                    eventType: 'comment',
                    postId: notification.object.id,
                    commentId,
                    link
                });
            }
            //new reply your comment event
            else if (notification.title.match(/ replied to [a-z]+ comment on your post\./)) {
                let commentId = link && link.match(/&comment_id=([0-9]+)/);
                commentId = commentId && commentId[1] ;
                let replyCommentId = link && link.match(/&reply_comment_id=([0-9]+)/);
                replyCommentId = replyCommentId && replyCommentId[1] ;
                
                events.push({
                    eventType: 'reply_comment',
                    postId: notification.object.id,
                    commentId,
                    replyCommentId,
                    link
                });
            }
        });
        return events;
    }.bind(notificationDigestor);

    return notificationDigestor;
}

module.exports = getNotificationDigestor;