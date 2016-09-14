/**
 * Created by zhangfeng on 2016/8/26.
 */
'use strict';
var Q = require('q');
var httpUtil = require('./httpUtil');
var commonUtil = require('./commonUtil');
var log4js = require('log4js');
var logger = log4js.getLogger("info");
var baiduLbsAk = 'tPhNm3k9msoHmBjGPq9DLZNF';//百度开放平台密钥

/*默认位置*/
var defaultPosition = {
    "CITY": {
        "NAME": "上海",
        "FROMDESTID":  9,
        "PINYIN":"SHANGHAI",
        "CURRENTNAME":"上海"
    },
    "STATION": {
        "NAME": "上海",
        "CODE": "SH",
        "PINYIN": "shanghai",
        "STATIONID":1
    }
};

/*将H5的位置信息转换成要返回的数据结构*/
function h5ToLocation(obj) {
    return {
        "CITY": {
            "NAME": obj.CITY.N,
            "FROMDESTID":  obj.CITY.I,
            "PINYIN":obj.CITY.P,
            "CURRENTNAME":obj.CITY.CUR
        },
        "STATION": {
            "NAME": obj.ST.N,
            "CODE": obj.ST.C,
            "PINYIN": obj.ST.P,
            "STATIONID":obj.ST.I
        }
    }
}

/**
 * 将用户所使用的数据结构转换一下，只是字段名称长度变短了，主要是考虑到放入cokkie的体积
 * */
function locationToH5(obj) {
    return {
        "CITY": {
            "N": obj.CITY.NAME,
            "I":  obj.CITY.FROMDESTID,
            "P":obj.CITY.PINYIN,
            "CUR":obj.CITY.CURRENTNAME
        },
        "ST": {
            "N": obj.STATION.NAME,
            "C": obj.STATION.CODE,
            "P": obj.STATION.PINYIN,
            "I":obj.STATION.STATIONID
        }
    }
}

/**
 * 将php接口返回的数据转换成要返回的数据结构
 * */
function phpToLocation(obj) {
    return {
        "CITY": {
            "NAME": obj.city.name,
            "FROMDESTID":  obj.city.fromDestId,
            "PINYIN":obj.city.pinyin,
            "CURRENTNAME":obj.city.name
        },
        "STATION": {
            "NAME": obj.station.station_name,
            "CODE": obj.station.station_code,
            "PINYIN": obj.station.pinyin,
            "STATIONID":obj.station.station_id
        }
    }
}
module.exports = {
    /**
     * 1. 从cookie中取H5的位置信息，取到的话则转换数据结构并返回，方法结束；
     * 2. 从cookie中取APP存放的位置信息，取到的话则转换数据结构并返回，方法结束；
     * 3. 获取客户端IP，根据IP调用百度接口拿到城市名称；
     * 4. 通过城市名称调用PHP接口，拿到城市和站点信息，拿到了就转换数据结构，并返回；否则默认“上海”；
     * */
    getPositon: function (req,res) {
        var stationsReq = {
                url: "http://m.lvmama.com/bullet/index.php?s=/HtmlLocalization/getCityStationInfo",
                method: "get",
                params:{}
            },
            mapReq = {
                url: "http://api.map.baidu.com/location/ip?ak=" + baiduLbsAk + "&ip=220.178.149.167" +  "&coor=bd09ll",
                // url: "http://api.map.baidu.com/location/ip?ak=" + baiduLbsAk + "&ip=" + commonUtil.getClientIp(req) + "&coor=bd09ll",
                method: "get"
            };
        var appLocationInfo = req.cookies.H5_CITY;//app在cookie中存放的
        var h5LocationInfo = req.cookies.H5_POSITION;//H5公共定位插件在cookie中存放的
        var deferred = Q.defer();
        if(h5LocationInfo){
            var h5L = h5ToLocation(JSON.parse(h5LocationInfo));
            deferred.resolve(h5L);
            return deferred.promise;
        }else if(appLocationInfo){
            var h5L = commonUtil.decodeBase64(appLocationInfo);
            stationsReq.params.cityName = JSON.parse(h5L).CITY.NAME;
            httpUtil.get(stationsReq).then(function (data) {
                var parsedLocation = phpToLocation(data.datas);
                res.cookie('H5_POSITION', JSON.stringify(locationToH5(parsedLocation)), {maxAge:1000*60*60*6});//将失效时间设为6个小时
                deferred.resolve(parsedLocation);
            },function () {
                deferred.resolve(defaultPosition);
            })
            return deferred.promise;
        }
        //获取新版站点信息+根据ip地址定位当前城市
        httpUtil.get(mapReq).then(function (cityObj) {
            var content,city,
                code = cityObj.status;
            if (code != null && code === 0) {
                content = cityObj.content;
            } else {
                logger.error("调用百度接口出错，代码为: " + code);
            }
            if (content) {
                city = commonUtil.getPathValue(content, 'address_detail.city', '上海');
                stationsReq.params.cityName = city.replace(/[市|省]/g, "");
                httpUtil.get(stationsReq).then(function (data) {
                    var parsedLocation = phpToLocation(data.datas);
                    res.cookie('H5_POSITION', JSON.stringify(locationToH5(parsedLocation)), {maxAge:1000*60*60*6});
                    deferred.resolve(parsedLocation);
                },function () {
                    deferred.resolve(defaultPosition);
                })
            }
        }, function (e) {
            logger.error("getPositon方法异常，返回默认城市，错误信息：" + e.message);
            deferred.resolve(defaultPosition);
        });
        return deferred.promise;
    }
};


