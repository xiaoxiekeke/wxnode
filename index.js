var express=require("express")
var app=express()
var routes = require('./routes');
var XMLParser=require('express-xml-bodyparser')
var bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })



//使用xmlparser插件解析请求体上的xml信息
app.use(XMLParser())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


// 通过带有 “/public 前缀的地址来访问 public 目录下面的文件
app.use('/', express.static(__dirname+'/WebRoot'));
app.use('/wxWeb', express.static(__dirname+'/wxWeb'));
app.use('/public', express.static(__dirname+'/public'));

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