/*
* 当在浏览器中访问 http://localhost:3000/ 时，
* 输出 CNode(https://cnodejs.org/ ) 社区首页的所有帖子标题和链接,时间，以 json 的形式。
* 学习使用 superagent 抓取网页
学习使用 cheerio 分析网页
* 待扩展-------下载音乐，小说？
* */

const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
var app = express()
app.get('/', function (req, res, next) {
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    superagent.get('https://cnodejs.org/')
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
           // console.dir(sres)  查了半天sres.text怎么来的，放弃了.........反正官方demo也直接给了
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(sres.text);
            // console.log(sres.text)
            var items = [];
            $('#topic_list .cell').each(function (index, element) {
                var $element = $(element);
                items.push({
                    title: $element.find('.topic_title').attr('title'),
                    href: $element.find('.topic_title').attr('href'),
                    date: $element.find('.last_active_time').text()
                });
            });

            res.json(items);
        });
});
app.listen(3000,function () {
    console.log('3000 is success')
})