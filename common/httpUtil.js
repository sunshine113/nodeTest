/**
 * Created by liutingting on 2016/4/6.
 */
'use strict';
var Q = require('q');//异步 deffer
var request = require("request");
var query = require("querystring");
var log4js = require('log4js');
var logger = log4js.getLogger("httpUtil");
module.exports = {
    //get请求
    get: function (object) {
        var deferred = Q.defer();
        var option = {
            url: object.url,
            qs: object.params,
            method: "GET",
            timeout: object.timeout || 10000,
            headers: {
                'signal': 'ab4494b2-f532-4f99-b57e-7ca121a137ca'
            }
        };
        logger.info("GET " + option.url + query.stringify(option.qs));
        var startTime = Date.now();
        request(option, function (e, res, body) {
            if (e) {
                logger.error(res && res.request && res.request.href);
                logger.error(e);
                deferred.reject(e);
            } else if (res.statusCode == 200) {
                try {
                    console.info('请求耗时：' + (Date.now() - startTime) / 1000 + 's. URL:' + option.url + query.stringify(option.qs));
                    deferred.resolve(JSON.parse(body));
                } catch (err) {
                    logger.error("接口返回数据异常：statusCode=" + res.statusCode + "  " + res.request.href);
                    logger.error(err);
                    deferred.resolve({});
                }
            } else {
                logger.error("接口请求异常：statusCode=" + res.statusCode + "  " + res.request.href);
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    },

//post 请求
    post: function (object) {
        var deferred = Q.defer();
        var option = {
            url: object.url,
            method: "POST",
            form: object.params,
            timeout: object.timeout || 10000,
            headers: {
                'signal': 'ab4494b2-f532-4f99-b57e-7ca121a137ca'
            }
        };

        logger.info("POST url:" + option.url);
        logger.info("param:" + JSON.stringify(option.form));
        var startTime = Date.now();
        request(option, function (e, res, body) {
            if (e) {
                logger.error(res && res.request && res.request.href);
                logger.error(e);
                deferred.reject(e);
            } else if (res.statusCode == 200) {
                try {
                    console.info('请求耗时：' + (Date.now() - startTime) / 1000 + 's. URL:' + option.url);
                    deferred.resolve(JSON.parse(body));
                } catch (err) {
                    logger.error(err)
                    deferred.resolve({});
                }
            } else {
                logger.error("接口请求异常：statusCode=" + res.statusCode + "  " + res.request.href);
                deferred.resolve("");
            }
        });
        return deferred.promise;
    },
    /*请求tdk接口，并替换其中动态参数
     * @key  接口参数
     * @obj  指定需要替换的对象，包含替换的标识和被替换的内容
     *       {reg1:content1, reg2:content2...}
     * */
    replaceTDK: function (key, obj) {
        var date = new Date();
        obj.year = date.getFullYear() + '年';
        obj.month = date.getMonth() + 1;
        obj.month = obj.month + '月';
        obj.day = date.getDay() + '日';
        var deferred = Q.defer();
        var option = {
            url: "http://m.lvmama.com/api/router/rest.do?method=api.com.tdk.queryTdkRule&version=1.0.0&debug=false&format=json&",
            method: "GET",
            qs: {key: key},
            timeout: 10000,
            headers: {
                'signal': 'ab4494b2-f532-4f99-b57e-7ca121a137ca'
            }
        };

        logger.info("请求tdk接口 " + option.url + query.stringify(option.qs));
        request(option, function (e, res) {
            if (e) {
                deferred.reject(e);
            } else {
                try {
                    var data = JSON.parse(res.body);
                    var t = data.data.title;
                    var d = data.data.description;
                    var k = data.data.keywords;
                    for (var item in obj) {
                        var reg = new RegExp(eval("/\\{\\$?" + item + "\\}/g"));
                        t = t.replace(reg, obj[item]);
                        d = d.replace(reg, obj[item]);
                        k = k.replace(reg, obj[item]);
                    }

                    deferred.resolve({t: t, d: d, k: k});
                } catch (err) {
                    logger.error(err);
                    deferred.resolve({t: "", d: "", k: ""});
                }
            }
        });
        return deferred.promise;
    },

//数据返回
    combineReq: function (allReq) {
        var arr = [];
        var that = this;
        allReq.forEach(function (item) {
            if (item.method && item.method.toLowerCase() === "post")
                arr.push(that.post(item));
            else
                arr.push(that.get(item));
        })
        return Q.all(arr).spread(function () {
            return arguments;
        });
    }
}




