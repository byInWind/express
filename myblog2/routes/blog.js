const express = require('express')
const router = express.Router()
const BlogModel = require('../lib/mongo').Blog
// const CommentModel = require('../models/comments')

const checkLogin = require('../middlewares/check').checkLogin

// GET /blog 所有用户或者特定用户的文章页
//   eg: GET /blog?author=xxx
router.get('/', function (req, res, next) {
    const author = req.query.author;
    BlogModel.find({author: author})
        .limit(5)
        .exec(function (err, blog) {
            if (blog) {
                res.render('blog', {
                    blog: blog
                })
            } else {
                res.render('blog')
            }
        })
})


// Blog /blog/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
    const author = req.session.user._id
    const title = req.fields.title
    const content = req.fields.content
    console.log('author ====' + author)
    // 校验参数
    try {
        if (!title.length) {
            throw new Error('请填写标题')
        }
        if (!content.length) {
            throw new Error('请填写内容')
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    let blog = {
        author: author,
        title: title,
        content: content
    }

    BlogModel.create(blog, function (err, result) {
        // 此 blog 是插入 mongodb 后的值，包含 _id
        console.log("result===" + result)
        blog = result
        req.flash('success', '发表成功')
        // 发表成功后跳转到该文章页
        res.redirect(`/blog/${blog._id}`)
    })
})

// GET /blog/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
    res.render('blog_create')
})

// GET /blog/:blogId 单独一篇的文章页
router.get('/:blogId', function (req, res, next) {
    const blogId = req.params.blogId
    // Promise.all([
    BlogModel.findOneAndUpdate({_id: blogId},{$inc: {pv: 1}}, function (err, blog) {
        console.log('blog is   ' + blog)
        if (err) {
            throw new Error(err)
        }
        if (blog) {
            res.render('blog_details', {
                blog: blog,
                // comments: comments
            })
        } else {
            throw new Error('该文章不存在')
        }

    })
    // 获取文章信息
    // CommentModel.getComments(blogId), // 获取该文章所有留言
    // BlogModel.methods.incPv = function (blogId) {  // pv 加 1
    //     BlogModel.updateOne({pv: 1})
    // }
    // ])
    // .then(function (result) {
    //     console.log(result)
    //     const blog = result[0]
    //     // const comments = result[1]
    //     if (!blog) {
    //         throw new Error('该文章不存在')
    //     }
    //
    //     res.render('blog_details', {
    //         blog: blog,
    //         // comments: comments
    //     })
    // })
    // .catch(function () {
    //     console.log('rtuiioi11111111')
    // })
})

// GET /blog/:blogId/edit 更新文章页
router.get('/:blogId/edit', checkLogin, function (req, res, next) {
    const blogId = req.params.blogId
    const author = req.session.user._id

    BlogModel.getRawBlogById(blogId)
        .then(function (blog) {
            if (!blog) {
                throw new Error('该文章不存在')
            }
            if (author.toString() !== blog.author._id.toString()) {
                throw new Error('权限不足')
            }
            res.render('blog_edit', {
                blog: blog
            })
        })
})

// Blog /blog/:blogId/edit 更新一篇文章
router.post('/:blogId/edit', checkLogin, function (req, res, next) {
    const blogId = req.params.blogId
    const author = req.session.user._id
    const title = req.fields.title
    const content = req.fields.content

    // 校验参数
    try {
        if (!title.length) {
            throw new Error('请填写标题')
        }
        if (!content.length) {
            throw new Error('请填写内容')
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    BlogModel.findOne({_id: blogId}, function (blog) {
        if (!blog) {
            throw new Error('文章不存在')
        }
        if (blog.author._id.toString() !== author.toString()) {
            throw new Error('没有权限')
        }
        BlogModel.updateBlogById(blogId, {title: title, content: content})
            .then(function () {
                req.flash('success', '编辑文章成功')
                // 编辑成功后跳转到上一页
                res.redirect(`/blog/${blogId}`)
            })
    })
})

// GET /blog/:blogId/remove 删除一篇文章
router.get('/:blogId/remove', checkLogin, function (req, res, next) {
    const blogId = req.params.blogId
    const author = req.session.user._id
    BlogModel.findByIdAndDelete(blogId, function (err, blog) {
        if (err) {
            throw new Error(err)
        }
        if (!blog) {
            throw new Error('文章不存在')
        }
        if (blog.author._id.toString() !== author.toString()) {
            throw new Error('没有权限')
        }
        console.log('删除文章成功')
        //
        // BlogModel.delBlogById(blogId, author)
        //     .then(function () {
        //         req.flash('success', '删除文章成功')
        //         // 删除成功后跳转到主页
        //         res.redirect('/blog')
        //     })
        //     .catch(next)
    })
})

module.exports = router
