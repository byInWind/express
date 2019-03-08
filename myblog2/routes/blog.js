const express = require('express')
const router = express.Router()
const BlogModel = require('../lib/mongo').Blog
const UserModel = require('../lib/mongo').User
const CommentModel = require('../lib/mongo').Comment
const marked = require('marked')

const checkLogin = require('../middlewares/check').checkLogin
 
// GET /blog 所有blog
router.get('/', function (req, res, next) {
    BlogModel.find({})
    // .populate('author')
    // .limit(5)
        .exec(function (err, blogs) {
            if (blogs) {
                //现在留言数为0，数据库里没有存留言数，手动计算留言数
                //循环所有blog,为每个blog添加commentsCount属性,,待解决
                // blogs.forEach(function (blog) {
                //
                // });
                // Promise.all(blogs.map(function (blog) {
                //     // return (
                //         CommentModel.find({}, function (err, comments) {
                //             blog.commentsCount = comments.length;
                //         })
                //     // )
                // })).then(function (val) {
                //   console.log('val is xxxxxx')
                //     res.render('blog', {
                //         blog: blogs
                //     })
                // });

                // new Promise(function (resolve) {
                //     var xxss = blogs.forEach(function (blog) {
                //         CommentModel.find({}, function (err, comments) {
                //             blog.commentsCount = comments.length
                //             // console.log("comments is " + blog.commentsCount)
                //             return blog
                //         })
                //     });
                //     // var xxss =  blogs[0].commentsCount = 5;
                //     // console.log('xxss', xxss)
                //     resolve(xxss)
                // }).then(function (val) {
                //     console.log('val is ' + val)
                //     res.render('blog', {
                //         blog: blogs
                //     })
                // })
                // console.log('enddddddddd')
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
    var author = decodeURI(req.path);
    author = author.split('/')[1];
    const query = {};
    if (author) {
        query.name = author
    }
    //先查用户，再查blog
    UserModel.findOne(query, '_id', function (err, user) {
        BlogModel.find({author: user._id})
        // .populate('author')
        // .limit(5)
            .exec(function (err, blogs) {
                if (blogs) {
                    //现在留言数为0，数据库里没有存留言数，手动计算留言数
                    //循环所有blog,为每个blog添加commentsCount属性,,待解决
                    // blogs.forEach(function (blog) {
                    //
                    // });
                    // Promise.all(blogs.map(function (blog) {
                    //     // return (
                    //         CommentModel.find({}, function (err, comments) {
                    //             blog.commentsCount = comments.length;
                    //         })
                    //     // )
                    // })).then(function (val) {
                    //   console.log('val is xxxxxx')
                    //     res.render('blog', {
                    //         blog: blogs
                    //     })
                    // });

                    // new Promise(function (resolve) {
                    //     var xxss = blogs.forEach(function (blog) {
                    //         CommentModel.find({}, function (err, comments) {
                    //             blog.commentsCount = comments.length
                    //             // console.log("comments is " + blog.commentsCount)
                    //             return blog
                    //         })
                    //     });
                    //     // var xxss =  blogs[0].commentsCount = 5;
                    //     // console.log('xxss', xxss)
                    //     resolve(xxss)
                    // }).then(function (val) {
                    //     console.log('val is ' + val)
                    //     res.render('blog', {
                    //         blog: blogs
                    //     })
                    // })
                    // console.log('enddddddddd')
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
    const path = req.path;
    var str = path.split('/');
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
        res.redirect(`/blog/${str[1]}/${blog._id}`)
    })
})

// GET /blog/:blogId 文章详情页
router.get('/:authorName/:blogId', function (req, res, next) {
    const blogId = req.params.blogId
    // Promise.all([
    BlogModel.findOneAndUpdate({_id: blogId}, {$inc: {pv: 1}}, function (err, blog) {
        if (err) {
            throw new Error(err)
        }
        if (blog) {
            // 获取文章信息
            CommentModel.find({blogId: blogId}, function (err, comments) {
                if (err) {
                    throw new Error(err)
                }
                //为每个blog添加commentsCount属性,待解决
                blog.commentsCount = comments.length;
                //转为marked语法
                comments.map(function (comment) {
                    comment.content = marked(comment.content)
                    // return comment
                })
                // console.log("xx=====  " + comments)
                res.render('blog_details', {
                    blog: blog,
                    comments: comments
                })
            })

        } else {
            throw new Error('该文章不存在')
        }

    })
    // // 获取文章信息
    // CommentModel.findById(blogId,function (err,xx) {
    //     console.log(xx)
    // }) // 获取该文章所有留言
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
    BlogModel.findOneAndUpdate(blogId, {title: title, content: content}, function (err, blog) {
        if (err) {
            throw new Error(err)
        }
        if (!blog) {
            throw new Error('文章不存在')
        }
        if (blog.author._id.toString() !== author.toString()) {
            throw new Error('没有权限')
        }
        req.flash('success', '编辑文章成功')
        // 编辑成功后跳转到上一页
        res.redirect(`/blog/${blogId}`)
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
        req.flash('success', '删除文章成功')
        // 删除成功后跳转到主页
        res.location('back');
    })
})

module.exports = router
