var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var hash = crypto.createHash('sha1');

// 对网站首页的访问返回 "Hello World!" 字样
router.get('/', function (req, res) {
	//1.将tampstap,nonce,token,echostr按字典序排序
	
	var timestamp=req.query.timestamp;
	var nonce=req.query.nonce;
	var token='xiaoke';
	var signature=req.query.signature;
	var echostr=req.query.echostr;

	// 将三个参数进行字典序排序
	var arr=[timestamp,nonce,token];
	arr.sort();

	// 将三个参数拼接成一个字符串进行sha1加密
	var sign=hash.update(arr.join('').digest('hex'));

	// 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	if (signature===sign) {
		res.status.send(echostr);
	}else{
		res.send("invalid sign")
	}

});
	

module.exports = router;