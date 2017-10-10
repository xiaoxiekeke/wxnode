var express=require("express")
var app=express()
var routes = require('./routes');
var XMLParser=require('express-xml-bodyparser')


app.use(XMLParser())

// 通过带有 “/static” 前缀的地址来访问 public 目录下面的文件
app.use('/static', express.static('public'));




// 路由
routes(app);



// 如何处理 404 ？
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

// 设置一个错误处理器
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

var server=app.listen(8083,function(){
	var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
})