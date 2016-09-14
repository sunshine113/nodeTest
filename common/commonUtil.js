/**
 * Created by Sunzhenghua on 2016/6/17.
 */
'use strict';
module.exports = {
    /**
     * 判断对象中是否存在指定属性（或属性路径）
     * 示例：判断{a:{b:{c:[{d:123}]}}}是否存在a.b.c[0].d => hasPath(obj, 'a.b.c[0].d')
     * @param object 对象
     * @param path 属性值，可以是路径，如：'a.b.c[0].d'
     * @returns {boolean} 判断结果
     */
    hasPath: function (object, path) {
        if (typeof object !== 'object' || typeof path !== 'string') {
            return false;
        }
        path = path.split(/[\.\[\]]/).filter(function (n) {
            return n != ''
        });
        var index = -1,
            len = path.length,
            key,
            result = true;
        while (++index < len) {
            key = path[index];
            if (!object.hasOwnProperty(key)) {
                result = false;
                break;
            }
            object = object[key];
        }
        return result;
    },

    /**
     * 获取对象的指定属性（或属性路径）
     * 示例：获取对象{a:{b:{c:[{d:123}]}}}的属性a.b.c[0].d => getPathValue(obj, 'a.b.c[0].d')
     * @param object 对象
     * @param path 属性值，可以是路径，如：'a.b.c[0].d'
     * @param defaultVal [optional] 默认值，可不传
     * @returns 返回结果
     */
    getPathValue: function (object, path, defaultVal) {
        var ret = defaultVal || '';
        if (typeof object !== 'object' || typeof path !== 'string') {
            return defaultVal;
        }
        path = path.split(/[\.\[\]]/).filter(function (n) {
            return n != ''
        });
        var index = -1,
            len = path.length,
            key,
            result = true;
        while (++index < len) {
            key = path[index];
            if (!object.hasOwnProperty(key)) {
                result = false;
                break;
            }
            object = object[key];
        }
        if (result) {
            ret = object;
        }
        return ret;
    },

    /**
     * 判断设备平台
     * */
    isDevice: function(req){
        var ua = req.headers['user-agent'] || '';
        if(ua.indexOf('LVMM')> -1){
            if(ua.indexOf('iPhone') > -1){
                return 'ip';
            }else if(ua.indexOf('iPad') > -1){
                return 'pad';
            }else if(ua.indexOf('Android') > -1){
                return 'ad';
            }else if(agent.indexOf("Windows") > 0 && agent.indexOf("Phone") > 0){
                return 'wp';
            }
        }else{
            return 'wap';
        }
    },

    /**
     * 判断是否为客户端,并返回客户端版本状态
     * @param req request对象
     * @returns {*}
     */
    isClient: function (req) {
        /*
         * 新的客户端判断逻辑
         * 0 非客户端
         * 01 最新版本客户端
         * 1 ios&android客户端
         * 02 ipad最新客户端
         * 3 weixin客户端
         * 2 ipad客户端
         * 4 wp客户端
         * */
        var that = this;
        var agent = req.headers['user-agent'] || '';
        var wp_version = req.query.wpversion;
        var wp_agent = req.query.wpagent;
        if (agent.indexOf("MicroMessenger") != -1) {
            return "3";
        } else if (agent.indexOf("LVMM") > 0) {
            return "1";
        } else if (agent.indexOf("Windows") > 0 && agent.indexOf("Phone") > 0 && wp_agent == "LVMM") {
            //判别来自wp系列
            if (wp_version == that.nearestVerWP) {
                return "04";
            } else {
                return "4";
            }
        } else {
            return "0"; //非客户端
        }
    },
    /*对象是否为空*/
    isNotEmpty: function (Arr) {
        if (Arr == null || Arr == undefined || Arr.length == 0) {
            return false;
        }
        return true;
    },
    destOrPOI: function (typeStr) {
        /*CONTINENT      大洲
         * SPAN_COUNTRY   跨国家地区
         * COUNTRY        国家
         * SPAN_PROVINCE  跨州省地区
         * PROVINCE       州省
         * SPAN_CITY      跨城市地区
         * CITY           城市
         * SPAN_COUNTY    跨区县地区
         * COUNTY         区/县
         * SPAN_TOWN      跨乡镇地区
         * TOWN           乡镇/街道
         * SCENIC         景区
         * VIEWSPOT       景点
         * SCENIC_ENTERTAINMENT 娱乐点
         * RESTAURANT     餐厅
         * HOTEL          酒店
         * SHOP           购物点
         * VIEWSPOT,SCENIC_ENTERTAINMENT,RESTAURANT,HOTEL,SHOP 属于POI，其他属于目的地
         * */
        var poiTypes = ['VIEWSPOT', 'SCENIC_ENTERTAINMENT', 'RESTAURANT', 'HOTEL', 'SHOP'];
        var type = "dest";
        poiTypes.forEach(function (ele) {
            if (typeStr == ele)
                type = "poi";
        });
        return type;
    },
    /**
     * 获取客户端ip地址
     * @param req
     * @returns {*}
     */
    getClientIp: function (req) {
        var ipAddress;

        var clientIp = req.headers['x-client-ip'];
        var forwardedForAlt = req.headers['x-forwarded-for'];
        var realIp = req.headers['x-real-ip'];

        var clusterClientIp = req.headers['x-cluster-client-ip'];
        var forwardedAlt = req.headers['x-forwarded'];
        var forwardedFor = req.headers['forwarded-for'];
        var forwarded = req.headers['forwarded'];

        var reqConnectionRemoteAddress = req.connection ? req.connection.remoteAddress : null;
        var reqSocketRemoteAddress = req.socket ? req.socket.remoteAddress : null;
        var reqConnectionSocketRemoteAddress = (req.connection && req.connection.socket) ? req.connection.socket.remoteAddress : null;
        var reqInfoRemoteAddress = req.info ? req.info.remoteAddress : null;

        // x-client-ip
        if (clientIp) {
            ipAddress = clientIp;
        }

        // x-forwarded-for
        else if (forwardedForAlt) {
            var forwardedIps = forwardedForAlt.split(',');
            ipAddress = forwardedIps[0];
        }

        // x-real-ip
        // (default nginx proxy/fcgi)
        else if (realIp) {
            ipAddress = realIp;
        }

        // x-cluster-client-ip
        else if (clusterClientIp) {
            ipAddress = clusterClientIp;
        }

        // x-forwarded
        else if (forwardedAlt) {
            ipAddress = forwardedAlt;
        }

        // forwarded-for
        else if (forwardedFor) {
            ipAddress = forwardedFor;
        }

        // forwarded
        else if (forwarded) {
            ipAddress = forwarded;
        }

        // remote address checks
        else if (reqConnectionRemoteAddress) {
            ipAddress = reqConnectionRemoteAddress;
        }
        else if (reqSocketRemoteAddress) {
            ipAddress = reqSocketRemoteAddress
        }
        else if (reqConnectionSocketRemoteAddress) {
            ipAddress = reqConnectionSocketRemoteAddress
        }
        else if (reqInfoRemoteAddress) {
            ipAddress = reqInfoRemoteAddress
        }

        // return null if we cannot find an address
        else {
            ipAddress = null;
        }

        return ipAddress;
    },

    /**
     * 将utf8字符串编码为base64字符串
     * @param str
     * @returns {String}
     */
    encodeBase64: function (str) {
        return new Buffer(str, 'utf8').toString('base64');
    },

    /**
     * 将base64字符串解码为utf8字符串
     * @param str
     * @returns {String}
     */
    decodeBase64: function (str) {
        return new Buffer(str, 'base64').toString('utf8');
    }
};


