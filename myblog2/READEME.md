## node-express
学习自https://github.com/nswbmw/N-blog,使用 Express + MongoDB 搭建博客   

+ 改为更流行的Mongoose操作数据库的形式
+ 访问时改为更常见的用户名形式  /blog/用户名/blog
+ 这里的许多查询都用了callback形式，似乎不太合适，待完善修改
+ 一对多查询，根据用户查相关blog ，方法是在blog中查公共的'author'字段'  
+ 注意！！crud在后端都是异步的，连续操作结果不对，注意下是不是因为异步结果未返回
+ 时间字符串格式化,难过的哭泣，网上都没查到.mongoose的timestamps,createdAt无法格式化，即在模版里展示默认的createdAt,怎么格式化都无效.这里另设了一个属性替代createdAt,才实现  
