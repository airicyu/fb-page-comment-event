'use strict';

const should = require('chai').should;
const expect = require('chai').expect;

const notificationDigestor = require('./../src/utils/notification-digestor')();

const testPageId = '1620123456789123';
const testPostId = '1620512345678912';
const testNotificationId = ['1513612345678912', '1513612340078912'];
const testFromUserName = 'John Chan';
const testFromUserId = '10123456789123456';
const testCommentId = ['1620720123456788', '1620720123456789'];
const testReplyCommentId = '1620780123456789';
const testNotifications = [{
        "title": `${testFromUserName} replied to your comment on your post.`,
        "created_time": "2017-12-18T16:34:24+0000",
        "updated_time": "2017-12-18T16:38:02+0000",
        "id": `notif_${testPageId}_${testNotificationId[0]}`,
        "link": `http://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[0]}&reply_comment_id=${testReplyCommentId}`,
        "from": {
            "name": `${testFromUserName}`,
            "id": `${testFromUserId}`
        },
        "object": {
            "created_time": "2017-12-18T14:15:50+0000",
            "message": "test post",
            "id": `${testPageId}_${testPostId}`
        },
        "to": {
            "name": "Testing",
            "id": `${testPageId}`
        }
    },
    {
        "title": `${testFromUserName} commented on your post.`,
        "created_time": "2017-12-18T14:23:12+0000",
        "updated_time": "2017-12-18T15:14:32+0000",
        "id": `notif_${testPageId}_${testNotificationId[1]}`,
        "link": `http://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[1]}`,
        "from": {
            "name": `${testFromUserName}`,
            "id": `${testFromUserId}`
        },
        "object": {
            "created_time": "2017-12-18T14:15:50+0000",
            "message": "test post",
            "id": `${testPageId}_${testPostId}`
        },
        "to": {
            "name": "Testing",
            "id": `${testPageId}`
        }
    }
];

const expectEvents = [{
        eventType: 'reply_comment',
        postId: '1620123456789123_1620512345678912',
        commentId: '1620720123456788',
        replyCommentId: '1620780123456789',
        link: 'http://www.facebook.com/permalink.php?story_fbid=1620512345678912&id=1620123456789123&comment_id=1620720123456788&reply_comment_id=1620780123456789'
    },
    {
        eventType: 'comment',
        postId: '1620123456789123_1620512345678912',
        commentId: '1620720123456789',
        link: 'http://www.facebook.com/permalink.php?story_fbid=1620512345678912&id=1620123456789123&comment_id=1620720123456789'
    }
];

describe('Test notification digestor correct digest into events', function () {
    this.timeout(5000);

    it("Test generate workspace ID key with Admin Token", function (done) {
        notificationDigestor.digest(testNotifications).then((events) => {
            expect(events).to.eql(expectEvents);
            done();
        });
    });
});