
var config={
	success:{
		success:true,
		errCode:0,
		errMsg:""	
	},
	paramsError:{
		success:false,
		errCode:1,	
		errMsg:"参数错误"
	},
	nologin:{
		success:false,
		errCode:100,	
		errMsg:"没有登录或者登录超时"
	},
	fileExist:{
		success:false,
		errCode:333,	
		errMsg:"文件已存在"
	},
	timeout:{
		success:false,
		errCode:666,	
		errMsg:"系统响应超时"
	},
	serverErr:{
		success:false,
		errCode:999,	
		errMsg:"服务器处理出错"
	}
}



module.exports = config;