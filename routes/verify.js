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

//接受事件推送并回复
router.post('/', function (req, res) {
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

		// 如果签名验证通过后
		
		var msgtype = req.body.xml.msgtype[0].toString();



		if (msgtype=='text') {
			var tousername = req.body.xml.tousername[0].toString();
			var fromusername = req.body.xml.fromusername[0].toString();
			var createtime = Math.round(Date.now() / 1000);
			var content = req.body.xml.content[0].toString();
			var xmlstr=`<xml>
									 <ToUserName><![CDATA[${fromusername}]]></ToUserName>
									 <FromUserName><![CDATA[${tousername}]]></FromUserName>
									 <CreateTime>${createtime}</CreateTime>
									 <MsgType><![CDATA[${msgtype}]]></MsgType>
									 <Content><![CDATA[${content}]]></Content>
								 </xml>`

			res.set('Content-Type','text/xml')
			res.send(xmlstr)					 

		}else{
			var tousername = req.body.xml.tousername[0].toString();
			var fromusername = req.body.xml.fromusername[0].toString();
			var createtime = Math.round(Date.now() / 1000);
			var content = "抱歉，我们只能接受文本格式的消息";
			var xmlstr=`<xml>
									 <ToUserName><![CDATA[${fromusername}]]></ToUserName>
									 <FromUserName><![CDATA[${tousername}]]></FromUserName>
									 <CreateTime>${createtime}</CreateTime>
									 <MsgType><![CDATA[text]]></MsgType>
									 <Content><![CDATA[${content}]]></Content>
								 </xml>`
			res.set('Content-Type','text/xml')
			res.send(xmlstr)	
		};

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
      res.status(200).send(data);
    }
	})
});



// 获取微信ip列表
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
		      res.status(200).send(data);
		    }
			})
    }
	})
});


// 获取获取公共号的自动回复配置
router.get('/getWxAutoreplyInfo', function (req, res) {
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
			var proxy_url='https://api.weixin.qq.com/cgi-bin/get_current_autoreply_info?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});


// 获取公共号菜单接口
router.get('/getWxMenu', function (req, res) {
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
			var proxy_url='https://api.weixin.qq.com/cgi-bin/menu/get?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});


// 删除微信菜单
router.get('/delWxMenu', function (req, res) {
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
			var proxy_url='https://api.weixin.qq.com/cgi-bin/menu/get?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});


// 获取公众号已创建的用户标签
router.get('/getWxTag', function (req, res) {
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
			var proxy_url='https://api.weixin.qq.com/cgi-bin/tags/get?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});


// 获取公共号的用户列表
router.get('/getWxUserList', function (req, res) {
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
			var proxy_url='https://api.weixin.qq.com/cgi-bin/user/get?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});

// 获取用户基本信息
router.get('/getWxUserInfo', function (req, res) {
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
      if(!req.query.openid){
      	res.status(200).send("请在链接上拼上用户的openid！如：http://wxnode.xiaoxiekeke.com/verify/getWxUserInfo?openid=XXX");
      	return;
      }
			var proxy_url='https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+req.query.openid;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});

// 获取公共号的用户黑名单列表
router.get('/getWxBlackList', function (req, res) {
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
			var proxy_url='https://api.weixin.qq.com/cgi-bin/tags/members/getblacklist?access_token='+access_token;
			request({
				url: proxy_url,
		    method: req.method.toUpperCase(),
		    json: true,
		    body: req.body
			},function(error, response, data){
				if (!error && response.statusCode == 200) {
		      console.log('------接口数据------',data);
		      res.status(200).send(data);
		    }
			})
    }
	})
});



	

module.exports = router;