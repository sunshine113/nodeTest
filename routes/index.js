var express = require('express');
var wechat = require('wechat');
var router = express.Router();
var API = require('wechat-api')
    , appid = 'wxd966d2999a6c7a3d'
    , secret = '542bf2ffd06d39c8307216ab99f7ecaa';

//secret = '4b74c33bf0a35b6ea5ae86d0cfa6e0cd'
var api = new API(appid, secret);

router.use('/', wechat('sunshine', function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  console.log(message);
  //自定义回复
  res.reply({type: "text", content: 'Hello world!'});
//  自定义菜单
//  var menu = fs.readFileSync('../config/wx_menu.json');
  var menu = JSON.stringify(require('../config/wx_menu.json'));
  if(menu) {
    menu = JSON.parse(menu);
  }
  api.createMenu(menu, function(err, result){
    console.log(result)
  });
}));
module.exports = router;