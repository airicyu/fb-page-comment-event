'use strict';

const should = require('chai').should;
const expect = require('chai').expect;

const postDigestor = require('./../src/events/post-digestor')();

let longText = '0123456789';
for(let i=0; i<5; i++){
    longText += longText;
}

const testPageId = '1620123456789123';
const testPostId = ['1620512345678912', '1620512345678934'];
const testFromUserName = 'John Chan';
const testFromUserId = '10123456789123456';
const testCommentId = ['1620720123456788', '1620720123456789'];
const testCommentText = ['testing comment', longText];



const testFeeds = [{
        "id": `${testPageId}_${testPostId[0]}`,
        "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId[0]}&id=${testPageId}`,
        "comments": {
            "data": [{
                "message": testCommentText[0],
                "created_time": "2017-12-21T15:51:56+0000",
                "comment_count": 0,
                "from": {
                    "name": testFromUserName,
                    "id": testFromUserId
                },
                "id": `${testPostId}_${testCommentId[0]}`,
                "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[0]}`
            }],
            "paging": {
                "cursors": {
                    "before": "abc",
                    "after": "def"
                }
            }
        }
    },
    {
        "id": `${testPageId}_${testPostId[1]}`,
        "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId[1]}&id=${testPageId}`,
        "comments": {
            "data": [{
                "message": testCommentText[1],
                "created_time": "2017-12-20T15:51:56+0000",
                "comment_count": 0,
                "from": {
                    "name": testFromUserName,
                    "id": testFromUserId
                },
                "id": `${testPostId}_${testCommentId[1]}`,
                "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[1]}`
            }],
            "paging": {
                "cursors": {
                    "before": "abc",
                    "after": "def"
                }
            }
        }
    }
];

const expectEvents = [{
    "eventType": "comment",
    "data": {
        "pageId": "1620123456789123",
        "postId": testPostId[0],
        "commentId": testCommentId[0],
        "from": {
            "name": testFromUserName,
            "id": testFromUserId
        },
        "message": testCommentText[0],
        "commentCreateTime": 1513871516000,
        "link": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[0]}`
    }
}, {
    "eventType": "comment",
    "data": {
        "pageId": "1620123456789123",
        "postId": testPostId[1],
        "commentId": testCommentId[1],
        "from": {
            "name": testFromUserName,
            "id": testFromUserId
        },
        "message": testCommentText[1].substr(0,100) + '...',
        "commentCreateTime": 1513785116000,
        "link": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[1]}`
    }
}];

describe('Test feed digestor should correct digest feeds into events', function () {
    this.timeout(5000);

    it("Test digest feeds", function (done) {
        postDigestor.digest(testFeeds).then((events) => {
            expect(events).to.eql(expectEvents);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});