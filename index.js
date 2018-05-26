var express=require("express")
var app=express()
var routes = require('./routes');
var XMLParser=require('express-xml-bodyparser')
var bodyParser = require('body-parser')
var fs =require('fs')
var path =require('path')
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// 使用mongoose连接mongodb
var mongoose =require('mongoose')

var dbconfig ='mongodb://miniGame-runner:1qaz2wsx@localhost:19999/miniGame'
// var dbconfig ='mongodb://localhost/minigame-explore'
mongoose.connect(dbconfig);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("数据库成功连接");
});

//遍历模型文件所在的目录
var models_path=path.join(__dirname,'/model')
var walk = function(modelPath){
  fs
    .readdirSync(modelPath)
    .forEach(function(file){
      var filePath = path.join(modelPath,'/'+file)
      var stat = fs.statSync(filePath)

      if (stat.isFile()) {//判断是否文件
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      }else if(stat.isDirectory()){//判断是否文件夹
        walk(filePath)
      }
    })
}
walk(models_path)


//使用xmlparser插件解析请求体上的xml信息
app.use(XMLParser())

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit:'50mb' }));

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
app.use('/Images', express.static(__dirname+'/Images'));

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