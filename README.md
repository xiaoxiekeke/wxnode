自动化部署：

1、先提交到git

2、使用pm2进行部署：```pm2 deploy ecosystem.json production```

或者直接：```npm run deploy```


***

接口说明:

>>>基础接口

1、域名：```http://wxnode.xiaoxiekeke.com/```

2、接入微信：```http://wxnode.xiaoxiekeke.com/verify``` method="GET"
	 
	消息回复接口：```http://wxnode.xiaoxiekeke.com/verify``` method="POST"

3、获取AccessToken:```http://wxnode.xiaoxiekeke.com/verify/getAccessToken```

4、获取微信Ip地址：```http://wxnode.xiaoxiekeke.com/verify/getWxIp```

5、获取微信自动回复的配置：```http://wxnode.xiaoxiekeke.com/verify/getWxAutoreplyInfo```

>>>菜单管理

5、设置微信菜单：```http://wxnode.xiaoxiekeke.com/verify/setWxMenu?access_token=ACCESS_TOKEN``` method="POST"

6、获取微信菜单：```http://wxnode.xiaoxiekeke.com/verify/getWxMenu```

7、删除微信菜单：```http://wxnode.xiaoxiekeke.com/verify/delWxMenu```


>>>用户管理

8、获取公众号已创建的用户标签：```http://wxnode.xiaoxiekeke.com/verify/getWxTag```

9、获取公共号的用户列表：```http://wxnode.xiaoxiekeke.com/verify/getWxUserList```

10、获取用户的基本信息：```http://wxnode.xiaoxiekeke.com/verify/getWxUserInfo?openid=XXX```

11、获取用户黑名单列表：```http://wxnode.xiaoxiekeke.com/verify/getWxBlackList```


>>>JSSDK

12、获取JS-SDK使用权限：```http://wxnode.xiaoxiekeke.com/verify/getJsSdk```

13、检验是否成功获取jssdk权限：```http://wxnode.xiaoxiekeke.com/wxWeb/index.html```

