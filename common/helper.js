/**
 * Created by zhangfeng on 2016/5/18.
 */
'use strict';
var hbs=require('hbs');
exports.helper = function () {
    var blocks = {};
    hbs.registerHelper('extend', function(name, context) {
        var block = blocks[name];
        if (!block) {
            block = blocks[name] = [];
        }
        block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
    });

    hbs.registerHelper('block', function(name) {
        var val = (blocks[name] || []).join('\n');

        // clear the block
        blocks[name] = [];
        return val;
    });

    /*复杂表达式*/
    hbs.registerHelper('ex', function(str, options) {
        var result = "";
        try{
            (function(){result = eval(str)}).call(this);
            if (result) {
                return result;
            } else {
                return options.inverse(this);
            }
        }catch(e){
            console.log(str,'--Handlerbars Helper "ex" deal with wrong expression!');
            return options.inverse(this);
        }
    });
    
    /**
     * 复杂表达式的判断
     * {{#lvIf "..."}}
     *      <span>条件成立</span>
     * {{else}}
     *      <span>条件不成立</span>
     * {{/lvIf}}
     * */
    hbs.registerHelper('lvIf', function(str,options) {
        var result = "";
        try{
            (function(){result = eval(str)}).call(this);
            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }catch(e){
            console.log(str,'--Handlerbars Helper "lvIf" deal with wrong expression!');
            return options.inverse(this);
        }
    });

    /**
     * 复杂表达式的判断
     * {{#lvIf "..."}}
     *      <span>条件成立</span>
     * {{else}}
     *      <span>条件不成立</span>
     * {{/lvIf}}
     * */
    hbs.registerHelper('lvIf', function(str,options) {
        var result = "";
        try{
            (function(){result = eval(str)}).call(this);
            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }catch(e){
            console.log(str,'--Handlerbars Helper "lvIf" deal with wrong expression!');
            return options.inverse(this);
        }
    });

    hbs.registerHelper('compare',function(left,operator,right,options){
        if(arguments.length<3){
            throw  new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
        var operators = {
            '==':     function(l, r) {return l == r; },
            '===':    function(l, r) {return l === r; },
            '!=':     function(l, r) {return l != r; },
            '!==':    function(l, r) {return l !== r; },
            '<':      function(l, r) {return l < r; },
            '>':      function(l, r) {return l > r; },
            '<=':     function(l, r) {return l <= r; },
            '>=':     function(l, r) {return l >= r; },
            'typeof': function(l, r) {return typeof l == r; }
        };
        if (!operators[operator]) {
            throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
        }
        var result = operators[operator](left, right);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    hbs.registerHelper('slice', function(str,start,end) {
        if(str){
            return str.slice(start,end);
        }
    });

    hbs.registerHelper('toFixed', function(str,num) {
        if(!isNaN(str)){
            return str.toFixed(num);
        }
    });

    hbs.registerHelper("addOne",function(index){
        //返回+1之后的结果
        return index + 1;
    });
    /*
     type与尺寸对应关系如下:
     1：1200_480；
     2：720_540；
     3：480_320；
     4：360_270；
     5：300_200；
     6：200_150；
     7：200_80；
     8：180_120；
     9：121_91；
     10：定宽 1280；
     11：定宽 960；
     12：定宽 720；
     13：定宽 480；
     注意：只有url含有下列特征的地址才能转换相对应的尺寸，否则返回原始url
     uploads/pc/place2
     uploads/places
     uploads/comment
     uploads/php/origin
     uploads/pc/place_vst/hotels
     */
    hbs.registerHelper("picFilter",function(picUrl,type){
        var sizeReg=/_(1200_480|720_540|480_320|360_270|300_200|200_150|200_80|180_120|121_91|1280_|960_|720_|480_)\./;
        var picReg=/\.(png|jpg|bmp|gif|jpeg)$/i;
        var map=["1200_480","720_540","480_320","360_270","300_200","200_150","200_80","180_120","121_91","1280_","960_","720_","480_"];
        if(!/uploads/.test(picUrl)){
            return picUrl;
        }else if(sizeReg.test(picUrl)){
            return picUrl.replace(sizeReg,"_"+map[type-1]+".");
        }else{
            var tempArray=picUrl.split(picReg);
            return tempArray[0]+"_"+map[type-1]+"."+tempArray[1];
        }
    });

    hbs.registerHelper("distanceFilter", function(input) {
        if (input != undefined) {
            var DIST = Math.round(input / 100) / 10;
            return DIST;
        }
        return  input;
    })

    /**
     * @description 搜索结果页 poi类型转换
     * @params VIEWSPOT 景点 SCENIC_ENTERTAINMENT 娱乐点 RESTAURANT 餐厅 SHOP 购物点 HOTEL 酒店
     * @author Kevin
     */
    hbs.registerHelper('destTypeFilter',  function (input) {

        if (input != ""||input != undefined) {
            switch (input){
                case "VIEWSPOT" : input="景点";
                    break;
                case "SCENIC_ENTERTAINMENT" :input="娱乐";
                    break;
                case "RESTAURANT" :input="餐厅";
                    break;
                case "SHOP" :input="购物";
                    break;
                case "HOTEL" :input="酒店";
                    break;
            }
        }
        return  input;
    });

    hbs.registerHelper('objToString',function(obj){

        if (obj){
            return JSON.stringify(obj)
        }
    })

    /**
     * 当给的第一个值为空时，返回第二个值
     * 示例：{{coalesce commentNum 0}}
     */
    hbs.registerHelper('coalesce', function(a, b) {
        return a || b;
    });

    /*hbs.registerHelper('hotPlaceImgUrl',function(){//目的地项目使用
        var imgUrl = this.imgUrl?"http://pic.lvmama.com"+this.imgUrl:this.middleImage;
        return imgUrl;
    })*/

    hbs.registerHelper('destHotUrl',  function (destTy) {
        if (destTy == 'VIEWSPOT' || destTy == 'SCENIC_ENTERTAINMENT' || destTy == 'RESTAURANT' || destTy == 'HOTEL' || destTy == 'SHOP') {
            return "http://m.lvmama.com/lvyou/poi/sight-" + hotDests[i].destId + ".html";
        } else {
            return "http://m.lvmama.com/dest/" + hotDests[i].pinyin + hotDests[i].destId;
        }
    });

};