'use strict'
var mongoose=require('mongoose')
var Admin=mongoose.model('Admin')
var User=mongoose.model('User')
var Session=mongoose.model('Session')
const errConfig = require('./error.config')
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
	// next()
	if(!sessionid){
	  res.status(200).send({
			result:errConfig.nologin,
		});
		return
	}
	Session.findOne({
		sessionid:sessionid
	}).exec().then(function(result){
		if(!result){
			res.status(200).send({
				result:errConfig.nologin
			});
			return
		}else{
			next()
		}
	},function(err){
		res.status(200).send({
			result:errConfig.serverErr
		});
		return
	})

}