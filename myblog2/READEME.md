## node-express
学习自https://github.com/nswbmw/N-blog
使用 Express + MongoDB 搭建多人博客  
改为更流行的Mongoose操作数据库的形式

+ 访问时改为用户名/形式
+ 一对多查询，根据用户查相关blog,未实现   
注意！！crud在后端都是异步的，保存后查询结果为空，需要把查询放在保存的回调函数里
+ 难过的哭泣，网上都没查到，mongoose的timestamps,createdAt无法格式化，即在模版里展示默认的createdAt,怎么格式化都无效.这里另设了一个属性替代createdAt，才实现  
