var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var request= require('request');


// 接入微信
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

	// 4、开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	if (signature===sign) {
		res.status(200).send(echostr);
	}else{
		res.send("invalid sign")
	}

});



// 获取AccessToken
router.get('/getAccessToken', function (req, res) {
	//1.获取appId和appsecret
	var appId="wxeee44dbd49e6139a"
	var appsecret="daad8a1466f76f6c6e98601d6179ec3b"

	// 2、拼接成完整接口地址
	var proxy_url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appId+'&secret='+appsecret;

	// 3、发送请求并返回accessToken
	request({
		url: proxy_url,
    method: req.method.toUpperCase(),
    json: true,
    body: req.body
	},function(error, response, data){
		if (!error && response.statusCode == 200) {
      console.log('------接口数据------',data);
      res.status(200).send(data.access_token);
    }
	})

});



// 获取微信ip
router.get('/getWxIp', function (req, res) {
	//1.获取accessToken
	var access_token=""
	request({
		url: 'http://wxnode.xiaoxiekeke.com/verify/getAccessToken',
    method: req.method.toUpperCase(),
    json: true,
    body: req.body
	},function(error, response, data){
		if (!error && response.statusCode == 200) {
      access_token=data;
      console.log("access_token-------",access_token)
      // 2、拼接成完整接口地址
			var proxy_url='https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data.ip_list);
		    }
			})
    }
	})

	

	
	

});


//接受事件推送并回复
router.get('/responseMsg', function (req, res) {
	

});
	

module.exports = router;