//请求模块 
var libHttp = require('http');  //HTTP协议模块 
var libUrl = require('url');    //URL解析模块 
var libFs = require("fs");      //文件系统模块 
var libPath = require("path");  //路径解析模块 

//依据路径获取返回内容类型字符串,用于http响应头 
var funGetContentType = function (filePath) {
    var contentType = "";
    
    //使用路径解析模块获取文件扩展名 
    var ext = libPath.extname(filePath);
    
    switch (ext) {
        case ".html":
            contentType = "text/html";
            break;
        case ".js":
            contentType = "text/javascript";
            break;
        case ".css":
            contentType = "text/css";
            break;
        case ".gif":
            contentType = "image/gif";
            break;
        case ".jpg":
            contentType = "image/jpeg";
            break;
        case ".png":
            contentType = "image/png";
            break;
        case ".ico":
            contentType = "image/icon";
            break;
        default:
            contentType = "application/octet-stream";
    }
    
    //返回内容类型字符串 
    return contentType;
}


module.exports = function (app) {
	// 对网站首页的访问返回WebRoot中的内容
	app.get('/', function (req, res) {

	});

	// 网站首页接受 POST 请求
	app.post('/', function (req, res) {
	  res.send('Got a POST request');
	});

  app.use('/verify', require('./verify'));
  // app.use('/be', require('./be'));
  app.use('/api', require('./fe'));
  // app.use('/signup', require('./signup'));
  // app.use('/signin', require('./signin'));
  // app.use('/signout', require('./signout'));
  // app.use('/posts', require('./posts'));
  // app.use('/users', require('./users'));
  
  // 404 page
	app.use(function (req, res) {
	  if (!res.headersSent) {
	    res.status(404).send('<h1 style="text-align:center;height:500px;line-height:300px;color:#455758">404 NOT FOUND</h2>');
	  }
	});
};