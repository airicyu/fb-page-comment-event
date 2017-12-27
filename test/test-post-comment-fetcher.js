'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const winston = require('winston');
const silentLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'error' })
    ]
});
const moment = require('moment');

describe('Test post-comment fetcger should correct fetch post-comments', function () {
    this.timeout(5000);

    let testPageId = '1620123456789123';
    let testPostId = '1620512345678912';
    let testFromUserName = 'John Chan';
    let testFromUserId = '10123456789123456';
    let testCommentId = ['1620720123456788', '1620720123456789'];
    let testCommentText = ['testing comment', 'another comment'];

    let testData = {
        "id": `${testPageId}_${testPostId}`,
        "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}`,
        "comments": {
            "data": [{
                    "message": testCommentText[0],
                    "created_time": moment().add(2, 'hours').format(),
                    "comment_count": 0,
                    "from": {
                        "name": testFromUserName,
                        "id": testFromUserId
                    },
                    "id": `${testPostId}_${testCommentId[0]}`,
                    "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[0]}`
                },
                {
                    "message": testCommentText[1],
                    "created_time": moment().add(1, 'hours').format(),
                    "comment_count": 0,
                    "from": {
                        "name": testFromUserName,
                        "id": testFromUserId
                    },
                    "id": `${testPostId}_${testCommentId[1]}`,
                    "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[1]}`
                }
            ],
            "paging": {
                "cursors": {
                    "before": "abc",
                    "after": "def"
                }
            }
        }
    };

    let mockTransportAgent = async function (options) {

        let dummyResponse = testData;

        let uri = options.uri;
        return [{
            statusCode: 200,
            headers: {
                'x-page-usage': '{"call_count":1,"total_cputime":1,"total_time":1}',
                'x-app-usage': '{"call_count":1,"total_cputime":1,"total_time":1}'
            }
        }, dummyResponse];
    }

    let lib = require('./../src/lib');
    let mockApp;

    before(function (done) {
        mockApp = lib.pageCommentEventApp({
            monitorPosts: [{ pageId: testPageId, postId: testPostId }],
            accessToken: 'yyyyyy'
        });

        lib.setQueryAgent(mockTransportAgent);

        lib.setLogger(silentLogger);

        done();
    });

    it("Test fetch post-comment", function (done) {
        mockApp.run((events) => {
            expect(events).to.not.be.null;
            expect(events.length).to.gt(0);
            return done();
        });
    });

    after(function (done) {
        mockApp.stop().then(() => {
            done();
        });
    });
});