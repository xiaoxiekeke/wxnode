var crypto = require('crypto');

function JSSDK(appId,appSecret){
	this.appId=appId;
	this.appSecret=appSecret;
}

JSSDK.prototype={
	getSignPackage:function(url){
		const jsapiTicket=this.getJsapiTicket()
		const timestamp = Math.round(Date.now() / 1000)
		const noncestr = this.createNonceStr()

		const rawString = `jsapi_ticket=${jsapiTicket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
		const hash = crypto.createHash('sha1');
		const sign = hash.update(string).digest('hex');

		return {
			appId:this.appId,
			noncestr:noncestr,
			timestamp:timestamp,
			url:url,
			signature:signature,
			rawString:rawString
		}


	},
	getJsapiTicket:function(){

	},
	createNonceStr:function(){

	},
	getAccessToken:function(){

	}
}