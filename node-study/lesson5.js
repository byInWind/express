/*
*与4类似，抓取改为 插件async，使每次抓取3个
* ?????巨慢，不太对    mapLimit等第三个参数函数里提供了两个参数，用自己写的访问结果巨慢，系统提供的快很多 
**/
var express = require('express')
var async = require('async')
var superagent = require('superagent')
var cheerio = require('cheerio')
var app = express()
var url = require('url')
var num = 0

var cnodeUrl = 'https://cnodejs.org'
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
                if (num > 5) {
                    return
                }
                //url.resolve  不懂....
                // var href = url.resolve(cnodeUrl, $(item).find('.topic_title').attr('href')
                var href = cnodeUrl + $(item).find('.topic_title').attr('href')
                arr.push(href)
            });

            async.mapLimit(arr, 5, function (url, callback) {
                superagent.get(url)
                    .end(function (err, ssres) {
                        console.log(111111)
                        var topicPair = [url, ssres.text];
                        // 接下来都是 jquery 的用法了
                        var topicUrl = topicPair[0];   //传来的url
                        var topicHtml = topicPair[1];  //传来的html
                        var $ = cheerio.load(topicHtml);
                        callback(null, {
                            title: $('.topic_full_title').text().trim(),
                            href: topicUrl,
                            comment1: $('.reply_content').eq(0).text().trim(),
                        });
                    });
                // console.log(newArr)   //结果 [] [] [] [] [] []

            }, function (err, results) {
                if (err) throw err
                // results is now an array of the response bodies
                console.log('successssssssss', results)
                res.send(results)
            })
        })
});

app.listen(3000, function () {
    // console.log('success')
})
