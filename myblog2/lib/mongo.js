const config = require('config-lite')(__dirname)
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect(config.mongodb, {autoIndex: false, useNewUrlParser: true})

var UserSchema = new Schema({
    name: {type: 'string', required: true},
    password: {type: 'string', required: true},
    avatar: {type: 'string', required: false},
    gender: {type: 'string', enum: ['m', 'f', 'x'], default: 'x'},
    bio: {type: 'string', required: true},
    blogs: [{type: Schema.Types.ObjectId, ref: 'Blog'}]
});
UserSchema.index({name: 1}, {unique: true});
exports.User = mongoose.model('User', UserSchema);

// 1与-1是升序降序规则  根据用户名找到用户，用户名全局唯一
var BlogSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: 'string', required: true},
    content: {type: 'string', required: true},
    pv: {type: 'number', default: 0},
    commentsCount: {type: 'number', default: 0}
});
BlogSchema.index({name: 1}, {unique: true});
exports.Blog = mongoose.model('Blog', BlogSchema);

var CommentSchema = new Schema({
    author: {type: Schema.Types.ObjectId, required: true},
    content: {type: 'string', required: true},
    blogId: {type: Schema.Types.ObjectId, required: true}
}, {timestamps: true});
CommentSchema.index({blogId: 1});
exports.Comment = mongoose.model('Comment', CommentSchema);
