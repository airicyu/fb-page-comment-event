'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const winston = require('winston');
const silentLogger = winston.createLogger({
    transports: [
      new winston.transports.Console({ level: 'error' })
    ]
});

const feedDigestor = require('./../src/utils/feed-digestor')();


const testPageId = '1620123456789123';
const testPostId = ['1620512345678912', '1620512345678934'];
const testFromUserName = 'John Chan';
const testFromUserId = '10123456789123456';
const testCommentId = ['1620720123456788', '1620720123456789'];
const testCommentText = ['testing comment', 'another comment'];

const testFeeds = [{
        "id": `${testPageId}_${testPostId[0]}`,
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

const mockTransportNotificationAgent = async function (options) {

    let fakePreviousPage = `https://graph.facebook.com/v2.11/${testPageId}/notifications?fields=title,created_time,updated_time,id,link,from,object%7Bid%7D,message,to&format=json&include_read=true&access_token=EAAbr3Q8xOAQBAKvD7dhd8lPaclxqxvIfFRzkL5bscVCF1VYHO2ZB09awx9aJ2Q80QFn7tgeDTniHQ6gaZBqDl5eACzB6vHhKW7YEob0zv7AlaKlKbYSWn2mTZB4gezipZA3KOzDd5kv1KjFgXDoF086t97E4Q9sjSEMQNW9BuQZDZD&limit=25&since=1513791676&__paging_token=...&__previous=1`;
    let fakeNextPage = `https://graph.facebook.com/v2.11/${testPageId}/notifications?fields=title,created_time,updated_time,id,link,from,object%7Bid%7D,message,to&format=json&include_read=true&access_token=EAAbr3Q8xOAQBAKvD7dhd8lPaclxqxvIfFRzkL5bscVCF1VYHO2ZB09awx9aJ2Q80QFn7tgeDTniHQ6gaZBqDl5eACzB6vHhKW7YEob0zv7AlaKlKbYSWn2mTZB4gezipZA3KOzDd5kv1KjFgXDoF086t97E4Q9sjSEMQNW9BuQZDZD&limit=25&until=1513606992&__paging_token=...`;

    let dummyResponse = {
        data: testFeeds,
        paging: {
            cursors: {
                before: "abc",
                after: "def"
            }
        }
    };

    let uri = options.uri;
    return [{statusCode: 200}, dummyResponse];
}


const mockApp = require('./../src/main')({
    pageId: 'xxxxxx',
    accessToken: 'yyyyyy'
});

mockApp.setQueryAgent(mockTransportNotificationAgent);

mockApp.setLogger(silentLogger);

describe('Test feed fetcger should correct fetcg feeds', function () {
    this.timeout(5000);

    it("Test fetch feeds", function (done) {

        mockApp.getStateStore().setLastScannedCommentTime(1).then(() => {
            mockApp.run((events) => {
                expect(events).to.not.be.null;
                expect(events.length).to.gt(0);
                return done();
            });
        });

    });

    after(function (done) {
        mockApp.stop().then(()=>{
            done();
        });
    });
});