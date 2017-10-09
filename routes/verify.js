var express = require('express');
var router = express.Router();
var crypto = require('crypto');



router.get('/', function (req, res) {
	//1.将tampstap,nonce,token,echostr按字典序排序
	var token='xiaoke';
	var signature = req.query.signature;
	var timestamp = req.query.timestamp;
	var echostr   = req.query.echostr; 
	var nonce     = req.query.nonce;

	// 2、将三个参数进行字典序排序
	var arr=[timestamp,nonce,token];
	arr.sort();
	var arrstr =arr.join('');

	// 3、将三个参数拼接成一个字符串进行sha1加密
	var hash = crypto.createHash('sha1');
	var sign = hash.update(arrstr).digest('hex');
	
	console.log(sign)

	// 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	if (signature===sign) {
		res.status.send(echostr);
	}else{
		res.send("invalid sign")
	}
	// res.send('Got a GET request to verify');

});
	

module.exports = router;