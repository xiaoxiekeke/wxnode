// 后台接口

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var request= require('request');
var fs = require('fs');
const jsSdk = require('../libs/jssdk')
const errConfig = require('../libs/error.config')
var config=require('../libs/config')
var middleware=require('../libs/middleware')
var qiniu = require('qiniu')

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


// 登录
router.post('/login', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;

	Admin.findOne({
    userName:username
  }).exec().then(
	function(result) {
    // on resolve
    if (!result) {//没有的话创建
      //创建Entity：由Model创建的实体，使用save方法保存数据
      // admin = new Admin({
      //   userName:username,
      //   passWord:password
      // })
      // admin.save(function(err,doc){
      // 	if(err) {
      //   	console.log(err);
    	 //  	res.status(200).send({
    		// 		result:errConfig.serverErr
    		// 	});
	    	// } else {
	     //    res.status(200).send({
	    	// 		result:errConfig.success,
	    	// 		data:{
	    	// 			accessToken:doc
	    	// 		}
	    	// 	});
	    	// }
      // })
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
  },
  function(err) {
  	// on reject
  	console.log(err)
  	res.status(200).send({
			result:errConfig.serverErr
		});
  })
});
// 退出登录
router.post('/loginout', middleware.hasToken,function (req, res) {
	res.status(200).send({
		result:errConfig.success
	});
});


// 图片管理
router.post('/image/list', middleware.hasToken,function (req, res) {
	Image.find().sort({'meta.createAt':-1}).exec().then(function(result){
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

/***
router.post('/image/update', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	var imageData = req.body.imageData;
	var format=imageData.match(/(data:image\/)(\w+)(;base64)/)[2]
	var fullname=name+'.'+format
	var base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  var dataBuffer = new Buffer(base64Data, 'base64');
  var path='Images/'+fullname
  
	fs.exists(path,function(exist){
		if(exist){//上传的图片不可重复
  		res.status(200).send({
				result:errConfig.fileExist
			});
			return
  	}
		if(id){//修改
			fs.writeFile(path, dataBuffer, function(err) {
	      if(err){
	        res.status(200).send({
						result:errConfig.serverErr
					});
	      }else{
	        Image.findOne({id:id}).exec().then(function(result){
						if(result){
				      Image.findByIdAndUpdate(id,{name:name,url:path},function(err,doc){
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
						}else{
							res.status(200).send({
		    				result:errConfig.serverErr
		    			});
						}
					},function(err){
						res.status(200).send({
							result:errConfig.serverErr
						});
					})
	      }
		  });
		}else{//新增
			var image = new Image({
	      name:name,
	      url:path
	    })
	    fs.writeFile(path, dataBuffer, function(err) {
	      if(err){
	        res.status(200).send({
						result:errConfig.serverErr
					});
	      }else{
	      	image.save(function(err,doc){
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
	      }
	    })
		}
	})
});
***/
router.post('/image/update', middleware.hasToken,function (req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var imageData = req.body.imageData;
  var format=imageData.match(/(data:image\/)(\w+)(;base64)/)[2]
  var fullname=name+'.'+format
  var base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  var dataBuffer = new Buffer(base64Data, 'base64');
  var path='Images/'+fullname

  console.log("新增")
      // 1、将图片文件存到七牛
      // 2、将图片地址和图片名称存到数据库
  middleware.saveToQiniu(dataBuffer,format).then(function(ress){
    if (ress) {
      var url = config.qiniu.image+ress.key
      var name=fullname
      var image = new Image({
        name:name,
        url:url
      })
      image.save(function(err,doc){
        if(err) {
          res.status(200).send({
            result:errConfig.serverErr
          });
        } else {
          res.status(200).send({
            result:errConfig.success
          });
        }
      })
    };
  }).catch(function(err){
    res.status(200).send({
      result:errConfig.serverErr
    });
  })
  // Image.findOne({name:fullname}).exec().then(function(result){
  //   console.log(result)
  //   if (result) {
  //     // 根据名称判断是否有重复，如果是，则说明是更新
  //     // 1、根据文件名查到旧文件url
  //     // 2、根据旧文件url将七牛上的旧文件删除
  //     // 3、将新的文件上传到七牛
  //     // 4、新的文件地址更新到数据库
  //     var oldUrl=result.url
  //     oldUrl.replace("http://applet-mystery.xiaoxiekeke.com/","")
  //     middleware.delFromQiniu(oldUrl).then(function(ress){
  //       if (ress) {
  //         var url = config.qiniu.image+ress.key
  //         var name=fullname
  //         console.log(res)
  //       };
  //     }).catch(function(err){
  //       res.status(200).send({
  //         result:errConfig.serverErr
  //       });
  //     })


  //     // Image.findOne({id:id}).exec().then(function(result){
  //     //   if(result){

  //     //     // Image.findByIdAndUpdate(id,{name:name,url:path},function(err,doc){
  //     //     //   if(err) {
  //     //     //     console.log(err);
  //     //     //     res.status(200).send({
  //     //     //       result:errConfig.serverErr
  //     //     //     });
  //     //     //   } else {
  //     //     //     res.status(200).send({
  //     //     //       result:errConfig.success,
  //     //     //       data:{
  //     //     //         accessToken:doc
  //     //     //       }
  //     //     //     });
  //     //     //   }
  //     //     // })
  //     //   }else{
  //     //     res.status(200).send({
  //     //       result:errConfig.serverErr
  //     //     });
  //     //   }
  //     // },function(err){
  //     //   res.status(200).send({
  //     //     result:errConfig.serverErr
  //     //   });
  //     // })
  //   }else{
  //     // 如果没有，则是新增
  //     // 1、将图片文件存到七牛
  //     // 2、将图片地址和图片名称存到数据库
      
  //   };
    
  // },function(err){
  //   res.status(200).send({
  //     result:errConfig.serverErr
  //   });
  // })
  

});

/*
router.post('/image/del',middleware.hasToken, function (req, res) {
  var id = req.body.id;
  if(id){
    Image.findOne({_id:id}).exec().then(function(result){
      return result
    },function(err){
      res.status(200).send({
        result:errConfig.serverErr
      });
    }).then(function(result){
      fs.exists(result.url,function(exist){
        if(exist){//上传的图片不可重复
          fs.unlink(result.url,function (err) {
            if(err) {
              res.status(200).send({
                result:errConfig.serverErr
              });
            };
            Image.remove({_id:id},function(err,doc){
              if(err) {
                console.log(err);
                res.status(200).send({
                  result:errConfig.serverErr
                });
              } else {
                console.log(doc)
                res.status(200).send({
                  result:errConfig.success,
                  data:doc
                });
              }
            })
          })
        }else{
          Image.remove({_id:id},function(err,doc){
            if(err) {
              console.log(err);
              res.status(200).send({
                result:errConfig.serverErr
              });
            } else {
              console.log(doc)
              res.status(200).send({
                result:errConfig.success,
                data:doc
              });
            }
          })
        }
      })
    })
  }else{
    res.status(200).send({
      result:errConfig.paramsError
    });
  }
});
*/
router.post('/image/del',middleware.hasToken, function (req, res) {
	var id = req.body.id;
	if(id){
		Image.findOne({_id:id}).exec().then(function(result){
			return result
		},function(err){
			res.status(200).send({
				result:errConfig.serverErr
			});
		}).then(function(result){
      // 七牛中删除
      var oldUrl=result.url
      var key=oldUrl.replace("http://applet-mystery.xiaoxiekeke.com/","")
      middleware.delFromQiniu(key).then(function(ress){
        console.log(ress)
        if (ress.status==200) {
          console.log("ress")
          console.log(ress)
          //数据库中删除
          Image.remove({_id:id},function(err,doc){
            if(err) {
              console.log(err);
              res.status(200).send({
                result:errConfig.serverErr
              });
            } else {
              console.log(doc)
              res.status(200).send({
                result:errConfig.success,
                data:doc
              });
            }
          })
        }else{
          res.status(200).send({
            result:errConfig.serverErr
          });
        }
      }).catch(function(err){
        res.status(200).send({
          result:errConfig.serverErr
        });
      })

      
		})
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 地点管理
router.post('/address/list', middleware.hasToken,function (req, res) {
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

router.post('/address/update', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	var isActive = req.body.isActive;
	var left = req.body.left;
	var top = req.body.top;
	var backgroundImage = req.body.backgroundImage
	var dialogTypes = req.body.dialogTypes
	var remarks = req.body.remarks
	if(id){//修改
		Address.findByIdAndUpdate(id,{name:name,isActive:isActive,left:left,top:top,dialogTypes:dialogTypes,remarks:remarks,backgroundImage:backgroundImage},function(err,doc){
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
	}else{//新增
		var address = new Address({
      name:name,
      isActive:isActive,
      left:left,
      top:top,
      dialogTypes:dialogTypes,
      backgroundImage:backgroundImage,
      remarks:remarks
    })
    address.save(function(err,doc){
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
	}
});

router.post('/address/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Address.remove({_id:id},function(err,doc){
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 对话管理
router.post('/dialog/list', middleware.hasToken,function (req, res) {
	Dialog.find().populate('roleId','name').populate('addressId','name').sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/dialog/update', middleware.hasToken,function (req, res) {
	var addressId = req.body.addressId;
	var content = req.body.content;
	var roleId = req.body.roleId;
	var id = req.body.id;
	var dialogType = req.body.dialogType;
	var desc = req.body.desc;
	var afterSelect = req.body.afterSelect;
	if(id){//修改
    Dialog.findByIdAndUpdate(id,{addressId:addressId,content:content,roleId:roleId,dialogType:dialogType,desc:desc,afterSelect:afterSelect},function(err,doc){
    	if(err) {
      	console.log(err);
  	  	res.status(200).send({
  				result:errConfig.serverErr
  			});
    	} else {
    		res.status(200).send({
    			result:errConfig.success,
    			data:{
    				data:doc
    			}
    		});
    	}
    })
	}else{//新增
		var dialog = new Dialog({
      content:content,
      roleId:roleId,
      addressId:addressId,
      dialogType:dialogType,
      desc:desc,
      afterSelect:afterSelect
    })
    dialog.save(function(err,doc){
    	if(err) {
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
	}
});

router.post('/dialog/del', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var id = req.body.id;
	if(accessToken){
		if(id){
			Dialog.remove({_id:id},function(err,doc){
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
		}else{
			res.status(200).send({
				result:errConfig.paramsError
			});
		}
	}else{
		res.status(200).send({
			result:errConfig.serverErr
		});
	}
});


// 角色管理
router.post('/role/list', middleware.hasToken,function (req, res) {
	Role.find().sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/role/update', middleware.hasToken,function (req, res) {
	var image = req.body.image;
	var name = req.body.name;
	var id = req.body.id;
	var remarks = req.body.remarks
	if(id){//修改
		console.log(id)
    Role.findByIdAndUpdate(id,{image:image,name:name,remarks:remarks},function(err,doc){
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
	}else{//新增
		var role = new Role({
      image:image,
      name:name,
      remarks:remarks
    })
    role.save(function(err,doc){
    	if(err) {
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
	}
});

router.post('/role/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Role.remove({_id:id},function(err,doc){
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 消息管理
router.post('/message/list', middleware.hasToken,function (req, res) {
	Message.find().sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/message/update', middleware.hasToken,function (req, res) {
	var message = req.body.message;
	var type = req.body.type;
	var id = req.body.id;
	if(id){//修改
    Message.findByIdAndUpdate(id,{message:message,type:type},function(err,doc){
    	if(err) {
      	console.log(err);
  	  	res.status(200).send({
  				result:errConfig.serverErr
  			});
    	} else {
    		res.status(200).send({
    			result:errConfig.success,
    			data:{
    				data:doc
    			}
    		});
    	}
		},function(err){
			res.status(200).send({
				result:errConfig.serverErr
			});
		})
	}else{//新增
		var message = new Message({
      message:message,
      type:type
    })
    message.save(function(err,doc){
    	if(err) {
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
	}
});

router.post('/message/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Message.remove({_id:id},function(err,doc){
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 用户管理
router.post('/user/list', middleware.hasToken,function (req, res) {
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;
	var pageNum = req.body.pageNum;
	if(!pageNum){
		pageNum=1
	}
	User.find({
		'meta.createAt':{$in:[startTime,endTime]}
	},null,{
		skip:20*(pageNum-1),
		limit:20
	}).sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/user/ban', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var setBan = req.body.setBan;
	if(id){
    User.findByIdAndUpdate(id,{hasbanned:setBan},function(err,doc){
    	if(err) {
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 章节管理
router.post('/chapter/list', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	if(accessToken){
		Chapter.find().sort({'meta.createAt':-1}).exec().then(function(result){
			res.status(200).send({
				result:errConfig.success,
				// data:{
				// 	list:result
				// }
			});
		},function(err){
	  	res.status(200).send({
				result:errConfig.serverErr
			});
		})
	}else{
		res.status(200).send({
			result:errConfig.nologin
		});
	}
});

router.post('/chapter/update', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var id = req.body.id;
	var content = req.body.content;
	var price = req.body.price;
	var storyDate = req.body.storyDate;
	var title = req.body.title;
	var subTitle = req.body.subTitle;
	var weather = req.body.weather;
	var mysteryId = req.body.mysteryId;
	var addressId = req.body.addressId;
	var addressIdRemove = req.body.addressIdRemove;
	var addressIdAdd = req.body.addressIdAdd;
	var eventId = req.body.eventId;
	var eventFinish = req.body.eventFinish;
	var remarks = req.body.remarks
	var params={
      	content:content,
      	price:price,
      	storyDate:storyDate,
      	title:title,
      	subTitle:subTitle,
      	weather:weather,
      	mysteryId:mysteryId,
      	addressId:addressId,
      	addressIdRemove:addressIdRemove,
      	addressIdAdd:addressIdAdd,
      	eventId:eventId,
      	eventFinish:eventFinish,
      	remarks:remarks
      };
	if(accessToken){
		if(id){//修改
      Chapter.findByIdAndUpdate(id,params,function(err,doc){
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
		}else{//新增
			var chapter = new Chapter({
        content:content,
        price:price,
        storyDate:storyDate,
        title:title,
        subTitle:subTitle,
        weather:weather,
        mysteryId:mysteryId,
      	addressId:addressId,
      	addressIdRemove:addressIdRemove,
      	addressIdAdd:addressIdAdd,
      	eventId:eventId,
      	eventFinish:eventFinish,
      	remarks:remarks
      })
      chapter.save(function(err,doc){
      	if(err) {
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
		}
	}else{
		res.status(200).send({
			result:errConfig.nologin
		});
	}
});

router.post('/chapter/del', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var id = req.body.id;
	if(accessToken){
		if(id){
			Chapter.remove({_id:id},function(err,doc){
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
		}else{
			res.status(200).send({
				result:errConfig.paramsError
			});
		}
	}else{
		res.status(200).send({
			result:errConfig.serverErr
		});
	}
});


// 评论管理
router.post('/comment/list', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;
	var pageNum = req.body.pageNum;
	var cid = req.body.cid;
	if(!pageNum){
		pageNum=1
	}
	if(accessToken){
		Comment.find({
			'meta.createAt':{$in:[startTime,endTime]},
			cid:cid
		},null,{
			skip:20*(pageNum-1),
			limit:20
		}).populate('uid').populate('cid').sort({'meta.createAt':-1}).exec().then(function(result){
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
	}else{
		res.status(200).send({
			result:errConfig.nologin
		});
	}
});

router.post('/comment/hide', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var id = req.body.id;
	var isHide = req.body.isHide;
	if(accessToken){
		if(id){
			Comment.findByIdAndUpdate(id,{isHide:isHide},function(err,doc){
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
		}else{
			res.status(200).send({
				result:errConfig.paramsError
			});
		}
	}else{
		res.status(200).send({
			result:errConfig.serverErr
		});
	}
});

router.post('/comment/del', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var id = req.body.id;
	if(accessToken){
		if(id){
			Comment.remove({_id:id},function(err,doc){
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
		}else{
			res.status(200).send({
				result:errConfig.paramsError
			});
		}
	}else{
		res.status(200).send({
			result:errConfig.serverErr
		});
	}
});


// 结局管理
router.post('/result/list', middleware.hasToken,function (req, res) {
	Result.find().sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/result/update', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var cArr = req.body.cArr;
	var name = req.body.name;
	var image = req.body.image;
	var remarks = req.body.remarks
	if(id){//修改
    Result.findByIdAndUpdate(id,{cArr:cArr,name:name,remarks:remarks,image:image},function(err,doc){
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
	}else{//新增
		var result = new Result({
      cArr:cArr,
      name:name,
      image:image,
      remarks:remarks
    })
    result.save(function(err,doc){
    	if(err) {
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
	}
	
});

router.post('/result/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Result.remove({_id:id},function(err,doc){
    	if(err) {
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});

router.post('/result/detail', middleware.hasToken,function (req, res) {
	var accessToken = req.body.accessToken;
	var id = req.body.id;
	if(accessToken){
		Result.findOne({id:id}).exec().then(function(doc){
  		res.status(200).send({
  			result:errConfig.success,
  			data:{
  				accessToken:doc
  			}
  		});
		},function(err){
			res.status(200).send({
				result:errConfig.serverErr
			});
		})
	}else{
		res.status(200).send({
			result:errConfig.serverErr
		});
	}
});


// 谜团管理
router.post('/mystery/list', middleware.hasToken,function (req, res) {
	
	Mystery.find().sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/mystery/update', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var image = req.body.image;
	var lockImage = req.body.lockImage;
	var listTitleImage = req.body.listTitleImage;
  var name = req.body.name;
	var remarks = req.body.remarks


	if(id){//修改
    Mystery.findByIdAndUpdate(id,{lockImage:lockImage,image:image,listTitleImage:listTitleImage,name:name,remarks:remarks},function(err,doc){
    	if(err) {
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
	}else{//新增
		var mystery = new Mystery({
			lockImage:lockImage,
      image:image,
      listTitleImage:listTitleImage,
      name:name,
      remarks:remarks
    })
    mystery.save(function(err,doc){
    	if(err) {
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
	}
});

router.post('/mystery/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Mystery.remove({_id:id},function(err,doc){
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 谜团事件管理
router.post('/event/list', middleware.hasToken,function (req, res) {
		Event.find().populate("mId","name").populate("toChapterId","title").sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/event/update', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var content = req.body.content;
	var desc = req.body.desc;
	var mId = req.body.mId;
	var title = req.body.title;
	var toChapterId = req.body.toChapterId;
	var remarks = req.body.remarks

	if(id){//修改
    Event.findByIdAndUpdate(id,{content:content,desc:desc,mId:mId,title:title,toChapterId:toChapterId,remarks:remarks},function(err,doc){
    	if(err) {
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
	}else{//新增
		var event = new Event({
      content:content,
      desc:desc,
      mId:mId,
      title:title,
      toChapterId:toChapterId,
      remarks:remarks
    })
    console.log(event)
    event.save(function(err,doc){
    	if(err) {
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
	}
});

router.post('/event/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Event.remove({_id:id},function(err,doc){
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 选项管理
router.post('/option/list', middleware.hasToken,function (req, res) {
	Option.find().populate('addressId').sort({'meta.createAt':-1}).exec().then(function(result){
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

router.post('/option/update', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	var addressId = req.body.addressId;
	var chapterId = req.body.chapterId;
	var medal = req.body.medal;
	var name = req.body.name;
	var unlockAddressId = req.body.unlockAddressId;
	var addAddressId = req.body.addAddressId;
	var removeAddressId = req.body.removeAddressId;
  var dialogs = req.body.dialogs;
	var remarks = req.body.remarks;
  var optionScore=req.body.optionScore

	if(id){//修改
    Option.findByIdAndUpdate(id,{addressId:addressId,unlockAddressId:unlockAddressId,addAddressId:addAddressId,removeAddressId:removeAddressId,dialogs:dialogs,chapterId:chapterId,medal:medal,name:name,remarks:remarks,optionScore:optionScore},function(err,doc){
    	if(err) {
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
	}else{//新增
		var option = new Option({
      addressId:addressId,
      chapterId:chapterId,
      medal:medal,
      name:name,
      unlockAddressId:unlockAddressId,
      addAddressId:addAddressId,
      removeAddressId:removeAddressId,
      dialogs:dialogs,
      remarks:remarks,
      optionScore:optionScore
    })
    option.save(function(err,doc){
    	if(err) {
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
	}
});

router.post('/option/del', middleware.hasToken,function (req, res) {
	var id = req.body.id;
	if(id){
		Option.remove({_id:id},function(err,doc){
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
	}else{
		res.status(200).send({
			result:errConfig.paramsError
		});
	}
});


// 充值管理
router.post('/pay/list', middleware.hasToken,function (req, res) {
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;
	var pageNum = req.body.pageNum;
	if(!pageNum){
		pageNum=1
	}
	Option.find({
		'meta.createAt':{$in:[startTime,endTime]}
	},null,{
		skip:20*(pageNum-1),
		limit:20
	}).sort({'meta.createAt':-1}).exec().then(function(result){
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


//系统设置
router.post('/default/list', middleware.hasToken,function (req, res) {
  Default.find().exec().then(function(result){
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

router.post('/default/update', middleware.hasToken,function (req, res) {
  var id = req.body.id;
  var chapter = req.body.chapter;
  var address = req.body.address;
  var lastChapter=req.body.lastChapter;
  var defaultMedal = req.body.defaultMedal;
  var maxMedal = req.body.maxMedal;

  if(id){//修改
    Default.findByIdAndUpdate(id,{chapter:chapter,address:address,defaultMedal:defaultMedal,maxMedal:maxMedal,lastChapter:lastChapter},function(err,doc){
      if(err) {
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
  }else{//新增
    var defaults = new Default({
      chapter:chapter,
      address:address,
      lastChapter:lastChapter,
      defaultMedal:defaultMedal,
      maxMedal:maxMedal
    })
    defaults.save(function(err,doc){
      if(err) {
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
  }
});


module.exports = router;