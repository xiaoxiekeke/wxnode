// 前台接口
// 后台接口

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var request= require('request');
var fs = require('fs');
const jsSdk = require('../libs/jssdk')
const errConfig = require('../libs/error.config')
var middleware=require('../libs/middleware')

var mongoose=require('mongoose')

var Admin=mongoose.model('Admin')
var Image=mongoose.model('Image')
var Address=mongoose.model('Address')
var Dialog=mongoose.model('Dialog')
var Role=mongoose.model('Role')
var Message=mongoose.model('Message')
var User=mongoose.model('User')
var Chapter=mongoose.model('Chapter')
var Comment=mongoose.model('Comment')
var Result=mongoose.model('Result')
var Mystery=mongoose.model('Mystery')
var Event=mongoose.model('Event')
var Option=mongoose.model('Option')
var Topup=mongoose.model('Topup')


// 登录
router.post('/login', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	User.findOne({
    userName:username
  }).exec().then(function(result) {
    // on resolve
    if (!result) {//没有的话创建
      //创建Entity：由Model创建的实体，使用save方法保存数据
      user = new User({
        userName:username,
        passWord:password
      })
      user.save(function(err,doc){
      	if(err) {
        	console.log(err);
    	  	res.status(200).send({
    				result:errConfig.serverErr
    			});
	    	} else {
	        res.status(200).send({
	    			result:errConfig.success,
	    			data:{
	    				accessToken:doc
	    			}
	    		});
	    	}
      })
      res.status(200).send({
  			result:{
  				success:false,
  				errCode:100,	
  				errMsg:"用户不存在"
  			}
  		});
    }else{//有的话判断
    	console.log(result)
    	if (password===result.passWord) {
    		res.status(200).send({
    			result:errConfig.success,
    			data:{
    				accessToken:result._id
    			}
    		});
    	}else{
    		res.status(200).send({
    			result:{
    				success:false,
    				errCode:100,	
    				errMsg:"用户名或密码错误，请重新输入"
    			}
    		});
    	}
    }
  },function(err) {
  	// on reject
  	console.log(err)
  	res.status(200).send({
			result:errConfig.serverErr
		});
  })
});


// 地点列表
router.post('/map/list', middleware.hasUserToken,function (req, res) {
	Address.find().sort({'meta.createAt':-1}).exec().then(function(result){
		res.status(200).send({
			result:errConfig.success,
			data:{
				list:result
			}
		});
	},function(err){
		// on reject
  	console.log(err)
  	res.status(200).send({
			result:errConfig.serverErr
		});
	})
});

// 地点内容
router.post('/map/detail', middleware.hasUserToken,function (req, res) {
	var id = req.body.id;
  var p1 = new Promise(function (resolve, reject) {
    Address.findOne({_id:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });
  var p2 = new Promise(function (resolve, reject) {
    Dialog.find({_id:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });
  var p3 = new Promise(function (resolve, reject) {
    Option.find({_id:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });

  Promise.all([p1, p2, p3]).then(function (results) {
    res.status(200).send({
      result:errConfig.success,
      data:{
        Address:{
          ...result[0],
          dialogList:...result[1],
          optionList:...result[2] 
        }
      }
    });
    console.log(results); 
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 辅助探索
router.post('/map/help', middleware.hasUserToken,function (req, res) {
  var medal = req.body.medal;
  var accessToken = req.body.accessToken;
  var p1 = new Promise(function (resolve, reject) {
    User.findByIdAndUpdate(accessToken,{'$inc':{'medal':-medal}},{
      new: true
    },function(err,doc){
      if(err){
        reject(err)
      }else{
        resolve(doc) 
      }
    })
  });
  p1.then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 选项选择
router.post('/map/optionSelect', middleware.hasUserToken,function (req, res) {

  var accessToken = req.body.accessToken;
  var addAddress =req.body.addAddress;
  var removeAddress =req.body.removeAddress;
  var unlockAddress =req.body.unlockAddress;
  var unlockChapter =req.body.unlockChapter;
  var returnDate={
    address:[],
    chapter:[]
  };

  var p1 = new Promise(function (resolve, reject) {
    if(addAddress){
      User.findByIdAndUpdate(accessToken,{$push:{address:addAddress}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          returnDate.address=doc.address
          resolve(doc)
        }
      })
    }else{
      resolve({})
    }
  });
  var p2 = new Promise(function (resolve, reject) {
    if(removeAddress){
      User.findByIdAndUpdate(accessToken,{$pull:{address:removeAddress}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          returnDate.address=doc.address
          resolve(doc)
        }
      })
    }else{
      resolve({})
    }
  });
  var p3 = new Promise(function (resolve, reject) {
    if(unlockAddress){
      User.findByIdAndUpdate(accessToken,{$push:{address:unlockAddress}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          returnDate.address=doc.address
          resolve(doc)
        }
      })
    }else{
      resolve({})
    }
  });
  var p4 = new Promise(function (resolve, reject) {
    if(unlockChapter){
      User.findByIdAndUpdate(accessToken,{$push:{chapter:unlockChapter}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          returnDate.chapter=doc.chapter
          resolve(doc)
        }
      })
    }else{
      resolve({})
    }
  });

  Promise.all([p1, p2, p3,p4]).then(function (results) {
    res.status(200).send({
      result:errConfig.success,
      data:...returnDate
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});



// 章节内容
router.post('/chapter/detail', middleware.hasUserToken,function (req, res) {
  var id = req.body.id;
  var p1 = new Promise(function (resolve, reject) {
    Chapter.findOne({_id:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });
  p1.then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 章节列表
router.post('/chapter/list', middleware.hasUserToken,function (req, res) {
  Chapter.find().sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        list:result
      }
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 评论列表
router.post('/chapter/commentList', middleware.hasUserToken,function (req, res) {
  var chapterId=req.body.chapterId
  Comment.find({'cid':chapterId}).sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        list:result
      }
    });
  },function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 评论提交
router.post('/chapter/toComment', middleware.hasToken,function (req, res) {
  var accessToken = req.body.accessToken;
  var content = req.body.content;
  var chapterId = req.body.chapterId;

  //新增
  var comment = new Comment({
    uid:accessToken,
    cid:chapterId,
    content:content,
    isHide:false
  })
  comment.save(function(err,doc){
    if(err) {
      res.status(200).send({
        result:errConfig.serverErr
      });
    } else {
      res.status(200).send({
        result:errConfig.success,
        data:{
          ...doc
        }
      });
    }
  })
});

// 阅读完成
router.post('/chapter/readed', middleware.hasUserToken,function (req, res) {
  var id = req.body.chapterId;
  var accessToken = req.body.accessToken;
  var p1 = new Promise(function (resolve, reject) {
    Chapter.findOne({_id:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });
  function mysteryId(){
    if(result.mysteryId.length>0){
      User.findByIdAndUpdate(accessToken,{$push:{mystery:result.mysteryId}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }else{
      resolve(result)
    }
  }
  function eventId(){
    if(result.eventId.length>0){
      User.findByIdAndUpdate(accessToken,{$push:{event:result.eventId}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }else{
      resolve(result)
    }
  }
  function eventFinish(){
    if(result.eventFinish.length>0){
      User.findByIdAndUpdate(accessToken,{$push:{explored:result.eventFinish}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }else{
      resolve(result)
    }
  }
  function addressId(){
    if(result.addressId){
      User.findByIdAndUpdate(accessToken,{$push:{address:result.addressId}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }else{
      resolve(result)
    }
  }
  function addressIdRemove(){
    if(result.addressIdRemove){
      User.findByIdAndUpdate(accessToken,{$pull:{address:result.addressIdRemove}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }else{
      resolve(result)
    }
  }
  function addressIdAdd(){
    if(result.addressIdAdd){
      User.findByIdAndUpdate(accessToken,{$push:{address:result.addressIdAdd}},{
        new: true
      },function(err,doc){
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }else{
      resolve(result)
    }
  }
  p1.then(function(result){
    return new Promise(mysteryId);
  }).then(function(result){
    return new Promise(eventId);
  }).then(function(result){
    return new Promise(eventFinish);
  }).then(function(result){
    return new Promise(addressId);
  }).then(function(result){
    return new Promise(addressIdRemove);
  }).then(function(result){
    return new Promise(addressIdAdd);
  }).then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});


// 消息列表
router.post('/message/list', middleware.hasUserToken,function (req, res) {
  Message.find().sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        list:result
      }
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});


// 勋章增加
router.post('/u/timerMedal', middleware.hasUserToken,function (req, res) {
  var medal = req.body.medal;
  var accessToken = req.body.accessToken;
  var p1 = new Promise(function (resolve, reject) {
    User.findByIdAndUpdate(accessToken,{'$inc':{'medal':medal}},{
      new: true
    },function(err,doc){
      if(err){
        reject(err)
      }else{
        resolve(doc) 
      }
    })
  });
  p1.then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 同步用户信息
router.post('/u/syncUserInfo', function (req, res) {
});


// 谜团列表
router.post('/mystery/list', middleware.hasUserToken,function (req, res) {
  Mystery.find().sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        list:result
      }
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 谜团线索列表
router.post('/event/list', middleware.hasUserToken,function (req, res) {
  var accessToken = req.body.accessToken;
  var mysteryId = req.body.mysteryId;
  Event.find({mId:mysteryId}).sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        list:result
      }
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 谜团线索详情
router.post('/event/detail', middleware.hasUserToken,function (req, res) {
  var id = req.body.id;
  Event.findOne({_id:id}).sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});


// 结局列表
router.post('/result/list', middleware.hasUserToken,function (req, res) {
  Result.find().sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        list:result
      }
    });
  },function(err){
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 结局详情
router.post('/result/detail', middleware.hasUserToken,function (req, res) {
  var id = req.body.id;
  Result.findOne({_id:id}).sort({'meta.createAt':-1}).exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});


//充值接口
router.post('/medal/add', middleware.hasUserToken,function (req, res) {
  var medal = req.body.medal;
  var accessToken = req.body.accessToken;
  var p1 = new Promise(function (resolve, reject) {
    User.findByIdAndUpdate(accessToken,{'$inc':{'medal':medal}},{
      new: true
    },function(err,doc){
      if(err){
        reject(err)
      }else{
        resolve(doc) 
      }
    })
  });
  p1.then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

//消费接口
router.post('/medal/reduce', middleware.hasUserToken,function (req, res) {
  var medal = req.body.medal;
  var accessToken = req.body.accessToken;
  var p1 = new Promise(function (resolve, reject) {
    User.findByIdAndUpdate(accessToken,{'$inc':{'medal':-medal}},{
      new: true
    },function(err,doc){
      if(err){
        reject(err)
      }else{
        resolve(doc) 
      }
    })
  });
  p1.then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:{
        ...result
      }
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});





module.exports = router;