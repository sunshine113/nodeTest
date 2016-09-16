var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var wechat = require('wechat')

//引用ejs模板
var ejs = require("ejs");
var app = express();
// view engine setup
app.use(express.query());
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs-mate'));  //设置html引擎
//app.engine('html', ejs.__express);  //设置html引擎
app.set('view engine', 'html'); // 设置视图引擎
app.locals._layoutFile = 'layout.html'; // 指定模板

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use('/', wechat('sunshine', function (req, res, next) {
    // 微信输入信息都在req.weixin上
    var message = req.weixin;
    console.log(message);
    res.reply({type: "text", content: 'Hello world!'});
}));*/

app.use('/', routes);
app.use('/users', users);
// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/


var server = app.listen("80", function (req,res) {
    //validate_token(req,res);
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
})



module.exports = app;
