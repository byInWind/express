const express = require('express')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect('mongodb://localhost:27017/test', {config: {autoIndex: false}})

// var usersSchema = new Schema({
//     name: {type: 'string'}
// })
// usersSchema.methods.say = function () {
//     console.log('ssdsgdha')
// }
// var User = mongoose.model("User", usersSchema)
//单个数据的保存
// var xxwww = new User({name: 'xxwww'})
// xxwww.save(function () {
// })
//多个数据的保存
// User.insertMany([{name: 'xxwww1'}, {name: 'xxwww2'}], function (err) {
//     console.log('保存成功')
//
// });
//User.find({name: 'xxwww1'}).exec()
// var fff = new User({name: '是是非非更'})
// User.deleteOne({name: 'xxwww1'}, function () {
// console.log('删除成功')
// })
//过时的apai.remove
// User.remove({name: 'xxwww'}, function () {
//     console.log('删除成功')
// })

const personSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    age: Number,
    stories: [{type: Schema.Types.ObjectId, ref: 'Story'}]
});

const storySchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'Person'},
    title: String,
    fans: [{type: Schema.Types.ObjectId, ref: 'Person'}]
});

const Story = mongoose.model('Story', storySchema);
const Person = mongoose.model('Person', personSchema);
const author = new Person({
    _id: new mongoose.Types.ObjectId(),
    name: 'Ian Fleming',
    age: 50
});

author.save(function (err) {
    if (err) return handleError(err);

    const story1 = new Story({
        title: 'Casino Royale',
        author: author._id    // assign the _id from the person
    });

    story1.save();
});
Story.findOne({title: 'Casino Royale'})
    .populate('author')
    .exec(function (err, story) {
        if (err) return handleError(err);
        console.log('The author is %s', story);
        // prints "The author is Ian Fleming"
    });
