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

app.get('/', function (req, res) {
    superagent.get(cnodeUrl)
        .end(function (err, _res) {
            if (err) {
                throw new error(err)
            }
            var arr = [] 
            var $ = cheerio.load(_res.text)
            $('#topic_list .cell').each(function (i, item) {
                //url.resolve  不懂....
                // var href = url.resolve(cnodeUrl, $(item).find('.topic_title').attr('href')
                var href = cnodeUrl + $(item).find('.topic_title').attr('href')
                arr.push(href)
            });
            res.send(arr)
        })
});
app.listen(3000, function () {
    console.log('success')
})
