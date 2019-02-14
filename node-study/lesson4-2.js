/*
* 当调用 node lesson4.js 时，它会输出 CNode(https://cnodejs.org/ ) 社区首页
* 的所有主题的标题链接和第一条评论，以 json 的格式。
*
* 上一课介绍了如何使用 superagent 和 cheerio 来取主页内容，那只需要发起一次 http get 请求就能办到。
* 但这次，我们需要取出每个主题的第一条评论，这就要求我们对每个主题的链接发起请求，并用 cheerio 去取出其中的第一条评论。
* */
var express = require('express')
var eventproxy = require('eventproxy')
var superagent = require('superagent')
var cheerio = require('cheerio')
var app = express()
var url = require('url')

var cnodeUrl = 'https://cnodejs.org'
//为了访问速度，只取5条 ,,,,,实验发现快了很多
var num = 0
var maxNum = 5

app.get('/', function (req, res) {
    superagent.get(cnodeUrl)
        .end(function (err, sres) {
            if (err) {
                throw new error(err)
            }
            var arr = []
            var $ = cheerio.load(sres.text)
            $('#topic_list .cell').each(function (i, item) {
                num++;
                if (num > maxNum) {
                    return
                }
                //url.resolve  不懂....
                // var href = url.resolve(cnodeUrl, $(item).find('.topic_title').attr('href')
                var href = cnodeUrl + $(item).find('.topic_title').attr('href')
                arr.push(href)
            });
            var promise = new Promise(function (resolve, reject) {
                var arr2 = [];
                arr.forEach(function (topicUrl) {
                    superagent.get(topicUrl)
                        .end(function (err, res) {
                            // console.log('fetch ' + topicUrl + ' successful');
                            // ep.emit('topic_html', [topicUrl, res.text]);
                            // console.log([topicUrl, ])
                            arr2.push([topicUrl, res.text]);
                            if (arr2.length == arr.length) {
                                resolve(arr2)
                            } else {

                            }
                        });
                });
            })
            promise.then(function (value) {
                value = value.map(function (topicPair) {
                    // 接下来都是 jquery 的用法了
                    var topicUrl = topicPair[0];   //传来的url
                    var topicHtml = topicPair[1];  //传来的html
                    var $ = cheerio.load(topicHtml);
                    console.log(topicUrl)
                    return ({
                        title: $('.topic_full_title').text().trim(),
                        href: topicUrl,
                        comment1: $('.reply_content').eq(0).text().trim(),
                    });
                });

                res.send(value)
            })

            // // 得到一个 eventproxy 的实例
            // var ep = new eventproxy();
            //
            // // 命令 ep 重复监听 arr.length 次（在这里也就是 5 次） `topic_html` 事件再行动
            // ep.after('topic_html', arr.length, function (topics) {
            //     // topics 不是arr，是包含了 arr.length 次 ep.emit('topic_html', pair) 中的那 5 个 值
            //     // 开始行动   map 类似与each
            //
            //     topics = topics.map(function (topicPair) {
            //         // 接下来都是 jquery 的用法了
            //         var topicUrl = topicPair[0];   //传来的url
            //         var topicHtml = topicPair[1];  //传来的html
            //         var $ = cheerio.load(topicHtml);
            //         return ({
            //             title: $('.topic_full_title').text().trim(),
            //             href: topicUrl,
            //             comment1: $('.reply_content').eq(0).text().trim(),
            //         });
            //     });
            //     res.send(topics)
            //     // console.log('final:');
            //     // console.log(topics);
            // });
            // //重复5次发送请求,获取原始内容(html)
            //
            // arr.forEach(function (topicUrl) {
            //     superagent.get(topicUrl)
            //         .end(function (err, res) {
            //             // console.log('fetch ' + topicUrl + ' successful');
            //             ep.emit('topic_html', [topicUrl, res.text]);
            //         });
            // });
        })
});

app.listen(3000, function () {
    console.log('success')
})
