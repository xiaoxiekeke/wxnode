var crypto = require('crypto');
var request= require('request');
var fs = require('fs');

function JSSDK(appId,appSecret){
	this.appId=appId;
	this.appSecret=appSecret;
}

JSSDK.prototype={
	getSignPackage:function(url,done){
		const instance=this
		this.getJsApiTicket(function(err,jsApiTicket){
			if(err){
				return done(err)
			}

			const timestamp = Math.round(Date.now() / 1000)
			const noncestr = instance.createNonceStr()
			const rawString = `jsapi_ticket=${jsApiTicket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
			const hash = crypto.createHash('sha1');
			const signature = hash.update(rawString).digest('hex');

			done(null,{
				appId:instance.appId,
				noncestr:noncestr,
				timestamp:timestamp,
				url:url,
				signature:signature
			})
		})
	},
	getJsApiTicket:function(done){
		const cacheFile='.jsApiTicket.json'
		const data=this.readCacheFile(cacheFile);
		const time=Math.round(Date.now() / 1000);
		const instance =this;
		if(typeof data.expireTime === 'undefined' || data.expireTime < time){
			instance.getAccessToken(function(error,accessToken){
				if(error){
					return done(error,null)
				}
				const url=`https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`
				request.get(url,function(err,res,body){
					if (err) {
						return done(err,null)
					};

					try {
						const data =JSON.parse(body);
						instance.writeCacheFile(cacheFile,{
							expireTime: Math.round(Date.now() / 1000) +7200,
							jsApiTicket: data.ticket
						})

						done(null,data.ticket)
					}catch(e){
						done(e,null)
					}

				})
			})
		}else{
			done(null,data.jsApiTicket)
		}

	},
	createNonceStr:function(){
		// return Math.random().toString(36).substr(2, 15);
		const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const length=chars.length;
		let str='';
		for (let i = 0; i < length; i++) {
			str += chars.substr(Math.round(Math.random()*length),1)
		};
		return str;
	},
	getAccessToken:function(done){
		const cacheFile = '.accesstoken.json';
    const instance = this;
    const data = instance.readCacheFile(cacheFile);
    const time = Math.round(Date.now() / 1000);

    if (typeof data.expireTime === 'undefined' || data.expireTime < time) {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
        request.get(url, function (err, res, body) {
            if (err) {
                return done(err, null);
            }
            try {
                const data = JSON.parse(body);
                instance.writeCacheFile(cacheFile, {
                    expireTime: Math.round(Date.now() / 1000) + 7200,
                    accessToken: data.access_token,
                });

                done(null, data.access_token);
            } catch (e) {
                done(e, null);
            }
        });
    } else {
        done(null, data.accessToken);
    }
	},
	readCacheFile:function(filename){
		try {
			return JSON.parse(fs.readFileSync(filename));
		} catch (e){
			console.log("read file %s failed: %s",filename,e)
		}
		return {}
	},
	writeCacheFile:function(filename,data){
		return fs.writeFileSync(filename,JSON.stringify(data));
	},
}

const jssdk=new JSSDK('wxeee44dbd49e6139a','daad8a1466f76f6c6e98601d6179ec3b')


module.exports=jssdk



