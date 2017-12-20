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

const mockTransportNotificationAgent = async function (options) {

    let fakePreviousPage = `https://graph.facebook.com/v2.11/${testPageId}/notifications?fields=title,created_time,updated_time,id,link,from,object%7Bid%7D,message,to&format=json&include_read=true&access_token=EAAbr3Q8xOAQBAKvD7dhd8lPaclxqxvIfFRzkL5bscVCF1VYHO2ZB09awx9aJ2Q80QFn7tgeDTniHQ6gaZBqDl5eACzB6vHhKW7YEob0zv7AlaKlKbYSWn2mTZB4gezipZA3KOzDd5kv1KjFgXDoF086t97E4Q9sjSEMQNW9BuQZDZD&limit=25&since=1513791676&__paging_token=...&__previous=1`;
    let fakeNextPage = `https://graph.facebook.com/v2.11/${testPageId}/notifications?fields=title,created_time,updated_time,id,link,from,object%7Bid%7D,message,to&format=json&include_read=true&access_token=EAAbr3Q8xOAQBAKvD7dhd8lPaclxqxvIfFRzkL5bscVCF1VYHO2ZB09awx9aJ2Q80QFn7tgeDTniHQ6gaZBqDl5eACzB6vHhKW7YEob0zv7AlaKlKbYSWn2mTZB4gezipZA3KOzDd5kv1KjFgXDoF086t97E4Q9sjSEMQNW9BuQZDZD&limit=25&until=1513606992&__paging_token=...`;
    
    let dummyResponse = {
        data: testNotifications,
        paging: {
            previous: fakePreviousPage,
            next: fakeNextPage
        },
    };

    let dummyNextResponse = {
        data: []
    };

    let uri = options.uri;
    if (uri !== fakeNextPage) {
        return [{}, dummyResponse];
    } else {
        return [{}, dummyNextResponse];
    }
}


const mockApp = require('./../src/main')({
    pageId : 'xxxxxx',
    accessToken : 'yyyyyy'
});

mockApp.setQueryAgent(mockTransportNotificationAgent);



describe('Test notification digestor correct digest into events', function () {
    this.timeout(5000);

    it("Test generate workspace ID key with Admin Token", function (done) {

        mockApp.getStateStore().setLastNotificationUpdateTime(0).then(()=>{
            mockApp.run((events)=>{
                console.log(events);
                expect(events).to.not.be.null;
                expect(events.length).to.gt(0);
                done();
            });
        });
        
    });

    after(function(){
        mockApp.stop();
    });
});