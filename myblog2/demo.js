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

// const personSchema = new Schema({
//     name: String,
//     age: Number,
//     stories: [{type: Schema.Types.ObjectId, ref: 'Story'}]
// });
//
// const storySchema = new Schema({
//     author: {type: String, ref: 'Person'},
//     title: String,
//     fans: [{type: Schema.Types.ObjectId, ref: 'Person'}]
// });
//
// const Story = mongoose.model('Story', storySchema);
// const Person = mongoose.model('Person', personSchema);
// const author = new Person({
//     name: 'aa',
//     age: 50,
// });
// const story1 = new Story({
//     title: 'bbbbbbbb',
//     author: author._id,    // assign the _id from the person
//     fans: new mongoose.Types.ObjectId()
// });
//
// // const story2 = new Story({
// //     title: 'xxxx',
// //     author: author._id,    // assign the _id from the person
// //     fans: new mongoose.Types.ObjectId()
// // });
// story1.save(function (err) {
//
// });
// // story2.save(function (err) {
// //
// // });
// author.save(function (err) {
//     console.log(111, author._id)
//
// });
// //person寻找固定的人，再寻找所有的story，，，，找不到
// // Person.findOne({name: 'aa'})
// //     .populate('stories')
// //     .exec(function (err, Storys) {
// //         console.log('The Story is %s', Storys);
// //         // prints "The author is Ian Fleming"
// //     });
// //story根据固定的人寻找，寻找到的是固定的人的所有story
//
//

const authorSchema = Schema({
    name: String,
    stories: [{type: Schema.Types.ObjectId, ref: 'Story'}]
});

const storySchema = Schema({
    author: {type: Schema.Types.ObjectId, ref: 'Author'},
    title: String
});

const Story = mongoose.model('Story', storySchema);
const Author = mongoose.model('Author', authorSchema);
const wxm = new Author({name: '司马迁'});

wxm.save(function (err) {
    if (err) {
        return handleError(err);
    }

    // 现在库中有了作者司马迁，我们来新建一条简介
    const story1 = new Story({
        title: "司马迁是历史学家1",
        author: wxm._id    // author 设置为作者 司马迁 的 _id。ID 是自动创建的。
    });
    const story2 = new Story({
        title: "司马迁是历史学家2",
        author: wxm._id    // author 设置为作者 司马迁 的 _id。ID 是自动创建的。
    });
    story1.save(function (err) {
        if (err) {
            return handleError(err);
        }  // 司马迁有了一条简介
        story2.save(function () {
            Story
                .find({author: wxm._id})
                .exec(function (err, stories) {
                    if (err) {
                        return handleError(err);
                    } // 返回所有 author 字段的值为 司马迁id 的简介
                    console.log(wxm._id)
                    console.log('stories is ' + stories)
                });
        })

    });
});
// Storyz

