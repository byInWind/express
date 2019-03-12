const express = require('express')
const router = express.Router()
const BlogModel = require('../lib/mongo').Blog
const CommentModel = require('../lib/mongo').Comment
const UserModel = require('../lib/mongo').User
const marked = require('marked')

const moment = require('moment')

const checkLogin = require('../middlewares/check').checkLogin

// GET /blog 所有blog
router.get('/', function (req, res, next) {
    BlogModel.find({})
        .populate('author')
        // .limit(5)
        .exec(function (err, blogs) {
            if (blogs) {
                res.render('blog', {
                    blog: blogs
                })
            } else {
                res.render('blog')
            }
        })
});
// GET /blog/用户name 用户的所有文章
router.get('/:authorName', function (req, res, next) {
    //根据用户name查找返回该用户的blog
    const authorName = req.params.authorName
    const query = {};
    if (authorName) {
        query.name = authorName
    }
    //先查用户，再查blog
    UserModel.findOne(query, '_id', function (err, user) {
        BlogModel.find({author: user._id})
            .populate('author')
            // .limit(5)
            .exec(function (err, blogs) {
                if (blogs) {
                    res.render('blog', {
                        blog: blogs
                    })
                } else {
                    res.render('blog')
                }
            })
    })
});


// GET /blog/create 发表文章
router.get('/:authorName/create', checkLogin, function (req, res, next) {
    res.render('blog_create')
});

// Blog /blog/create 发表文章
router.post('/:authorName/create', checkLogin, function (req, res, next) {
    const authorName = req.params.authorName
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

    let blog = {
        author: author,
        title: title,
        content: content
    }

    BlogModel.create(blog, function (err, result) {
        // 此 blog 是插入 mongodb 后的值，包含 _id
        blog = result
        req.flash('success', '发表成功')
        // 发表成功后跳转到该文章页
        res.redirect(`/blog/${authorName}/${blog._id}`)
    })
})

// GET /blog/:blogId 文章详情页
router.get('/:authorName/:blogId', function (req, res) {
    const blogId = req.params.blogId
    // Promise.all([
    BlogModel.findOneAndUpdate({_id: blogId}, {$inc: {pv: 1}})
        .populate('author')
        .exec(function (err, blog) {
            if (err) {
                throw new Error(err)
            }
            if (blog) {
                // 获取评论信息
                CommentModel.find({blogId: blogId}, function (err, comments) {
                    if (err) {
                        throw new Error(err)
                    }
                    //转为marked语法
                    comments.map(function (comment) {
                        comment.content = marked(comment.content);
                        //难过的哭泣，网上都没查到，mongoose的timestamps,createdAt无法格式化，即在模版里展示默认的createdAt,怎么格式化都无效
                        //这里另设了一个属性，才实现
                        comment.created_at = moment(comment.created_at).format('YYYY-MM-DD HH:mm')
                    });
                    res.render('blog_details', {
                        blog: blog,
                        comments: comments
                    })
                })
            } else {
                throw new Error('该文章不存在')
            }

        })
})

// GET /blog/:blogId/edit 更新文章页
router.get('/:authorName/:blogId/edit', checkLogin, function (req, res, next) {
    const blogId = req.params.blogId
    const author = req.session.user._id
    BlogModel.findOne({_id: blogId}, function (err, blog) {
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
router.post('/:authorName/:blogId/edit', checkLogin, function (req, res, next) {
    const authorName = req.params.authorName
    const blogId = req.params.blogId
    const author = req.session.user.name
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
    BlogModel.findOneAndUpdate({_id: blogId}, {title: title, content: content})
        .populate('author')
        .exec(function (err, blog) {
            if (err) {
                throw new Error(err)
            }
            if (!blog) {
                throw new Error('文章不存在')
            }
            if (blog.author.name.toString() !== author.toString()) {
                throw new Error('没有权限')
            }
            req.flash('success', '编辑文章成功')
            // 编辑成功后跳转到上一页
            res.redirect(`/blog/${authorName}/${blogId}`)
        })
})

// GET /blog/:blogId/remove 删除一篇文章
router.get('/:authorName/:blogId/remove', checkLogin, function (req, res, next) {
    const authorName = req.params.authorName
    const blogId = req.params.blogId
    const author = req.session.user._id
    BlogModel.findByIdAndDelete(blogId)
        .populate('author')
        .exec(function (err, blog) {
            if (err) {
                throw new Error(err)
            }
            if (blog.author._id.toString() !== author.toString()) {
                throw new Error('没有权限')
            }
            req.flash('success', '删除文章成功')
            // 删除成功后跳转到主页
            res.redirect(`/blog/${authorName}`)
        })
})

module.exports = router
