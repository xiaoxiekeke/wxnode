// 前台接口
// 后台接口

var express = require('express');
var http=require('http');
var request = require('request');  
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
const jsSdk = require('../libs/jssdk')
const errConfig = require('../libs/error.config')
var middleware=require('../libs/middleware')
var sha1=require('sha1')



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
var Default=mongoose.model('Default')
var Timeline=mongoose.model('Timeline')
var Session=mongoose.model('Session')

// Array.prototype.indexOf = function(val) {  
//   for (var i = 0; i < this.length; i++) {  
//   if (this[i] == val) return i;  
//   }  
//   return -1;  
// }; 

function remove(arr,val) {
  var index = arr.indexOf(val);  
  if (index > -1) {  
    arr.splice(index, 1);  
  } 
  return arr 
};

function getArray(a) {//去重
  var hash = {},
     len = a.length,
     result = [];
  for (var i = 0; i < len; i++){
     if (!hash[a[i]]){
         hash[a[i]] = true;
         result.push(a[i]);
     } 
  }
  return result;
};


// 登录
router.post('/login', function (req, res) {
  var AppId="wx7adbafc7365a8cf9"
  var AppSecret="37bfa52feb4e4f942d7d4ebb8d7e17ba"
  var code = req.body.code;
  var url='https://api.weixin.qq.com/sns/jscode2session?appid='+AppId+'&secret='+AppSecret+'&js_code='+code+'&grant_type=authorization_code'
  
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var body=JSON.parse(body)
      var sessionid=sha1(body.session_key+body.openid)
      var openid=body.openid
      var session_key=body.session_key
      console.log(sessionid,openid,session_key)
      
      // Session.remove({'openid':openid},function(err,doc){
      //   if(err) {
      //     console.log(err);
      //     res.status(200).send({
      //       result:errConfig.serverErr
      //     });
      //   } else {
      //     res.status(200).send({
      //       result:errConfig.success,
      //       data:{
      //         accessToken:doc
      //       }
      //     });
      //   }
      // })
      Session.find({'openid':openid},function(err,doc){
        if(err){
          res.status(200).send({
            result:errConfig.serverErr
          });
        }else{
          if(doc.length==0){
            //新增
            console.log("增")
            Default.find().exec().then(function(result){
              //用户表中插入一条数据
              User.create({
                'openid':openid,
                'chapter':result[0].chapter,
                'address':result[0].address,
                'medal':result[0].defaultMedal,
                'optionScore':0
              }, function(error,doc){
                if(error) {
                  console.log(error)
                  res.status(200).send({
                    result:errConfig.serverErr
                  });
                } else {
                  console.log(doc);
                  Session.create({
                    'sessionid':sessionid,
                    'openid':openid,
                    'session_key':session_key
                  }, function(error,doc){
                    if(error) {
                      res.status(200).send({
                        result:errConfig.serverErr
                      });
                    } else {
                      console.log(doc);
                      res.status(200).send({
                        result:errConfig.success,
                        data:{
                          sessionid:doc.sessionid
                        }
                      });
                    }
                  });
                }
              });
            },function(err){
              res.status(200).send({
                result:errConfig.serverErr
              });
            })
          }else{
            // 修改
            console.log("改")
            Session.findOneAndUpdate({'openid':body.openid},{$set:{
              'sessionid':sessionid,
              'session_key':session_key
            }},{
              new: true
            },function(err,doc){
              if(err){
                res.status(200).send({
                  result:errConfig.serverErr
                });
              }else{
                console.log(doc);
                res.status(200).send({
                  result:errConfig.success,
                  data:{
                    sessionid:doc.sessionid
                  }
                });
              }
            })
            
          }
          // resolve(doc)
        }
      })
    }else {
      console.log("[error]", err)
      res.status(200).send({
        result:errConfig.serverErr
      });
    }
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
    Dialog.find({addressId:id}).populate('roleId','name image').exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });
  var p3 = new Promise(function (resolve, reject) {
    Option.find({addressId:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });

  Promise.all([p1, p2, p3]).then(function (results) {
    console.log(results)
    res.status(200).send({
      result:errConfig.success,
      data:{
        Address:results[0],
        dialogList:results[1],
        optionList:results[2] 
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
      data:result
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
  var medal =req.body.medal;
  var optionScore=req.body.optionScore;

  User.findById(accessToken,function(err,user){
    if(err){
      res.status(200).send({
        result:errConfig.serverErr
      });
    }else{

      if (addAddress) {
        user.address.push(addAddress)
        user.address=getArray(user.address)
      };

      if (unlockAddress) {
        user.address.push(unlockAddress)
        user.address=getArray(user.address)
      };

      if (removeAddress) {
        user.address=remove(user.address,removeAddress)  
      };
      
      if (unlockChapter) {
        user.chapter.push(unlockChapter)
        user.chapter=getArray(user.chapter)
      };

      if (medal) {
        user.medal=user.medal-medal  
      };
      if (optionScore) {
        user.optionScore=user.optionScore+optionScore
      };

      User.findByIdAndUpdate(accessToken,{$set:user},{
        new:true
      },function(err,user){
        if (err) {
          res.status(200).send({
            result:errConfig.serverErr
          });
        }else{
          res.status(200).send({
            result:errConfig.success,
            data:user
          });  
        }
      });
      
    }
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
      data:result
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 章节列表
router.post('/chapter/list', middleware.hasUserToken,function (req, res) {
  Chapter.find().sort({'meta.createAt':1}).exec().then(function(result){
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
        data:doc
      });
    }
  })
});

// 阅读完成
router.post('/chapter/readed', middleware.hasUserToken,function (req, res) {
  var id = req.body.chapterId;
  var accessToken = req.body.accessToken;
  var optionScore=req.body.optionScore;
  var p1 = new Promise(function (resolve, reject) {
    Chapter.findOne({_id:id}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });
  
  p1.then(function(result){
    //result:当前章节
    User.findById(accessToken,function(err,user){
      if(err){
        res.status(200).send({
          result:errConfig.serverErr
        });
      }else{
        user.explored.push(result._id)
        user.explored=getArray(user.explored)
        user.mystery=getArray(user.mystery.concat(result.mysteryId))
        user.event=getArray(user.event.concat(result.eventId))
        user.eventFinish=getArray(user.eventFinish.concat(result.eventFinish))
        
        if (result.addressId) {
          user.address.push(result.addressId)
          user.address=getArray(user.address)
        };
        if (result.addressIdAdd) {
          user.address.push(result.addressIdAdd)
          user.address=getArray(user.address)
        };
        user.address=remove(user.address,result.addressIdRemove)
        user.medal=user.medal-result.price

        User.findByIdAndUpdate(accessToken,{$set:user},{
          new:true
        },function(err,user){
          if (err) {
            res.status(200).send({
              result:errConfig.serverErr
            });
          }else{
            res.status(200).send({
              result:errConfig.success,
              data:user
            });  
          }
        });
        
      }
    })
    
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  });
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
      data:result
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 同步用户信息
router.post('/u/syncUserInfo', function (req, res) {
  var sessionid = req.body.sessionid;
  var userInfo = req.body.userInfo;
  var isNew = req.body.isNew;


  // 1、根据sessionid从session表中找到openid
  var p1 = new Promise(function (resolve, reject) {
    Session.findOne({sessionid:sessionid}).exec().then(function(result){
      resolve(result)
    },function(err){
      reject(err)
    })
  });

  // // 2、找到系统默认设置的参数
  // var p2 = new Promise(function (resolve, reject) {
  //   Default.find().exec().then(function(result){
  //     resolve(result)
  //   },function(err){
  //     reject(err)
  //   })
  // });

  

  // 3、根据openid设置用户信息
  p1.then(function (result) {
    console.log(result)
    var openid=result.openid
    var params={
      'nickName':userInfo.nickName,
      'gender':userInfo.gender,
      'avatarUrl':userInfo.avatarUrl
    } 
    User.findOneAndUpdate({'openid':openid},{$set:params},{
      new: true
    },function(err,doc){
      if(err){
        console.log(err)
        res.status(200).send({
          result:errConfig.serverErr
        });
      }else{
        console.log(doc);
        res.status(200).send({
          result:errConfig.success,
          data:{
            address:doc.address,
            chapter:doc.chapter,
            mystery:doc.mystery,
            event:doc.event,
            explored:doc.explored,
            message:doc.message,
            unLockResult:doc.unLockResult,
            nickName:doc.nickName,
            avatarUrl:doc.avatarUrl,
            optionScore:doc.optionScore,
            medal:doc.medal,
            eventFinish:doc.eventFinish,
            _id:doc._id
          }
        });
      }
    })
  }).catch(function(err){
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
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
      data:result
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
  Result.find().sort({'meta.createAt':1}).exec().then(function(result){
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
      data:result
    });
  },function(err){
    // on reject
    console.log(err)
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

//解锁结局
router.post('/result/unlock', middleware.hasUserToken,function (req, res) {
  var id = req.body.id;
  var cArr=req.body.cArr;
  var resultId=req.body.resultId;

  User.findById(id,function(err,user){
    if(err){
      res.status(200).send({
        result:errConfig.serverErr
      });
    }else{
      if (cArr.length>0) {
        user.chapter=getArray(user.chapter.concat(cArr))
      };
      user.unLockResult.push(resultId)
      user.unLockResult=getArray(user.unLockResult)

      User.findByIdAndUpdate(id,{$set:user},{
        new:true
      },function(err,user){
        if (err) {
          res.status(200).send({
            result:errConfig.serverErr
          });
        }else{
          res.status(200).send({
            result:errConfig.success,
            data:user
          });  
        }
      });
      
    }
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
      data:result
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
      data:result
    });
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

// 配置列表
router.post('/default/list', middleware.hasUserToken,function (req, res) {
  Default.find().exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:result[0]
    });
  },function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

router.post('/getwxacord', middleware.hasUserToken,function (req, res) {
    var id = req.body.id;
    jsSdk.getAccessToken(function(err,accessToken){
      if(err){
        res.status(200).send({
          result:errConfig.serverErr
        });
        return;
      }
      var requestData={
        scene:id,
        width:136,
        is_hyaline:true
      }
      var readStream=request({
        url: "https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token="+accessToken,
        method: "POST",
        body: JSON.stringify(requestData)
      })
      var path='./Images/'+id+'.png';
      var writerStream = fs.createWriteStream(path);
      readStream.pipe(writerStream); 
      writerStream.on('finish', function() {
        var path='Images/'+id+'.png'
        User.findByIdAndUpdate(id,{'$set':{'wxacodeUrl':path}},{
          new: true
        },function(err,doc){
          if(err){
            res.status(200).send({
              result:errConfig.serverErr
            });
          }else{
            res.status(200).send({
              result:errConfig.success,
              data:doc
            });
          }
        })
        console.log("写入完成。");
      });
      writerStream.on('error', function(err){
         res.status(200).send({
           result:errConfig.serverErr
         });
      });

   })
});

router.post('/timelinemedal/list', middleware.hasUserToken,function (req, res) {
  var inviterId = req.body.inviterId;
  Timeline.find({inviterId:inviterId}).populate('inviteesId','nickName').exec().then(function(result){
    res.status(200).send({
      result:errConfig.success,
      data:result
    });
  },function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
});

router.post('/timelinemedal/add', middleware.hasUserToken,function (req, res) {
  var medal=req.body.medal
  var inviterId = req.body.inviterId;
  var inviteesId = req.body.inviteesId;
  var timeline=new Timeline({
    medal:medal,
    inviterId:inviterId,
    inviteesId:inviteesId
  })
  timeline.save(function(err,doc){
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
});


//test
router.post('/test',function (req, res) {
  res.status(200).send({
    result:""
  });
});

router.post('/chapter/list/test', middleware.hasUserToken,function (req, res) {
  Chapter.find().sort({'meta.createAt':1}).exec().then(function(result){
    var num=0
    for (var i = 0; i <= 50000; i++) {
      num=num+i
    };

    res.status(200).send({
      result:errConfig.success,
      data:{
        data:num
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




module.exports = router;