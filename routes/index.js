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
	// 对网站首页的访问返回 "Hello World!" 字样
	// app.get('/', function (req, res) {
	// 	//获取请求的url 
 //    var reqUrl = req.url;
    
 //    //向控制台输出请求的路径 
 //    console.log("1、",reqUrl);
    
 //    //使用url解析模块获取url中的路径名 
 //    var pathName = libUrl.parse(reqUrl).pathname;
 //    console.log("2、",pathName);    
 //    if (libPath.extname(pathName) == "") {
 //        //如果路径没有扩展名 
 //        pathName += "/"; //指定访问目录 
 //        console.log("3、",pathName); 
 //    }
 //    if (pathName.charAt(pathName.length - 1) == "/") {
 //        //如果访问目录 
 //        pathName += "index.html"; //指定为默认网页
 //        console.log("4、",pathName);  
 //    }
 //    console.log("5、",pathName);  
    
 //    //使用路径解析模块,组装实际文件路径 
 //    var filePath = libPath.join("/WebRoot", pathName);
 //    console.log("6、",filePath); 
 //    //判断文件是否存在 
 //    libFs.exists(filePath, function (exists) {
 //    		console.log('7、',exists)
 //        //文件存在
 //        if (exists) {
 //            //在响应头中写入内容类型 
 //            res.writeHead(200, { "Content-Type": funGetContentType(filePath) });
            
 //            //创建只读流用于返回 
 //            var stream = libFs.createReadStream(filePath, { flags: "r", encoding: null });
            
 //            //指定如果流读取错误,返回404错误 
 //            stream.on("error", function () {
 //                res.writeHead(404);
 //                res.end("<h1>404 Read Error</h1>");
 //            });
            
 //            //连接文件流和http返回流的管道,用于返回实际Web内容 
 //            stream.pipe(res);
 //        }
 //        else {
 //            //文件不存在，返回404错误 
 //            res.writeHead(404, { "Content-Type": "text/html" });
 //            res.end("<h1>文件不存在</h1>");
 //        }
 //    });
	// });

	// 网站首页接受 POST 请求
	app.post('/', function (req, res) {
	  res.send('Got a POST request');
	});

  app.use('/verify', require('./verify'));
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