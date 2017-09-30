

module.exports = function (app) {
	// 对网站首页的访问返回 "Hello World!" 字样
	app.get('/', function (req, res) {
		//1.将tampstap,nonce,token,echostr按字典序排序
	  res.send('Got a GET request');
	});

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