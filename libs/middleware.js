'use strict'
var mongoose=require('mongoose')
var Admin=mongoose.model('Admin')
var User=mongoose.model('User')
var Session=mongoose.model('Session')
const errConfig = require('./error.config')
var qiniu = require('qiniu')
var config=require('./config')
var Promise=require('bluebird')
var sha1=require('sha1')
var uuid=require('uuid')

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;
var mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK);

// var sha1=require('sha1')
// var config=require('../../config/config')
// var robot=require('../service/robot')
// var uuid=require('uuid')
exports.hasToken=function(req,res,next) {
	var accessToken=req.body.accessToken
	if(!accessToken){
	  res.status(200).send({
			result:errConfig.nologin,
		});
	}
	Admin.findOne({
		_id:accessToken
	}).exec().then(function(result){
		if(!result){
			res.status(200).send({
				result:errConfig.nologin
			});
		}else{
			next()
		}
	},function(err){
		res.status(200).send({
			result:errConfig.serverErr
		});
	})

}

exports.hasUserToken=function(req,res,next) {
	// var accessToken=req.body.accessToken
	var sessionid=req.headers.sessionid
	next()
	// if(!sessionid){
	//   res.status(200).send({
	// 		result:errConfig.nologin,
	// 	});
	// 	return
	// }
	// Session.findOne({
	// 	sessionid:sessionid
	// }).exec().then(function(result){
	// 	if(!result){
	// 		res.status(200).send({
	// 			result:errConfig.nologin
	// 		});
	// 		return
	// 	}else{
	// 		next()
	// 	}
	// },function(err){
	// 	res.status(200).send({
	// 		result:errConfig.serverErr
	// 	});
	// 	return
	// })

}

//将图片数据同步到七牛
exports.saveToQiniu=function(data,format){
	var key=uuid.v4()
	var options = {
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
  }
  key+='.'+format
  var putPolicy = new qiniu.rs.PutPolicy({scope:'wxapplet-mysteryexplore-files:' + key})
	var config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z0;
	var uploadToken=putPolicy.uploadToken(mac)

	var formUploader = new qiniu.form_up.FormUploader(config);
	var putExtra = new qiniu.form_up.PutExtra();

	return new Promise(function(resolve,reject){
		formUploader.put(uploadToken, key, data, putExtra, function(respErr,
		  respBody, respInfo) {
		  if (respErr) {
		    // throw respErr;
		    reject(respErr)
		  }
		  if (respInfo.statusCode == 200) {
		    resolve(respBody)
		  } else {
		  	resolve(respBody)
		    console.log(respInfo.statusCode);
		  }
		});
	})
}

//将图片数据从七牛中删除
exports.delFromQiniu=function(key){
	var bucket = "wxapplet-mysteryexplore-files";
	var key = key;
	console.log(key)
	var config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z0;
	

	return new Promise(function(resolve,reject){
		var bucketManager = new qiniu.rs.BucketManager(mac, config);
		bucketManager.delete(bucket, key, function(err, respBody, respInfo) {
		  if (err) {
		  	console.log(err)
		    reject(err)
		    //throw err;
		  } else {
		  	console.log("respInfo");
		    resolve(respInfo)
		  }
		});
	})
}