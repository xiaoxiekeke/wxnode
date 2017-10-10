###自动化部署：

1、先提交到git

2、使用pm2进行部署：```pm2 deploy ecosystem.json production```

或者直接：```npm run deploy```



###接口说明
1、域名：```http://wxnode.xiaoxiekeke.com/```

2、接入微信：```http://wxnode.xiaoxiekeke.com/verify```

3、获取AccessToken:```http://wxnode.xiaoxiekeke.com/verify/getAccessToken```

4、获取微信Ip地址：```http://wxnode.xiaoxiekeke.com/verify/getWxIp```


>>>菜单管理
5、获取微信菜单：```http://wxnode.xiaoxiekeke.com/verify/getWxMenu```

6、删除微信菜单：```http://wxnode.xiaoxiekeke.com/verify/delWxMenu```


>>>用户管理

7、获取公众号已创建的用户标签：```http://wxnode.xiaoxiekeke.com/verify/getWxTag```

8、获取公共号的用户列表：```http://wxnode.xiaoxiekeke.com/verify/getWxUserList```

9、获取用户的基本信息：```http://wxnode.xiaoxiekeke.com/verify/getWxUserInfo```

10、获取用户黑名单列表：```http://wxnode.xiaoxiekeke.com/verify/getWxBlackList```

