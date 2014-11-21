/**
* @author Jason Dobry <jason.dobry@gmail.com>
* @file angular-cache.min.js
* @version 3.1.1 - Homepage <https://github.com/jmdobry/angular-cache>
* @copyright (c) 2013-2014 Jason Dobry <http://www.pseudobry.com>
* @license MIT <https://github.com/jmdobry/angular-cache/blob/master/LICENSE>
*
* @overview angular-cache is a very useful replacement for Angular's $cacheFactory.
*/

!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){function c(a,b,c){for(var d=a[c],e=b(d);c>0;){var f=Math.floor((c+1)/2)-1,g=a[f];if(e>=b(g))break;a[f]=d,a[c]=g,c=f}}function d(a,b,c){for(var d=a.length,e=a[c],f=b(e);;){var g=2*(c+1),h=g-1,i=null;if(d>h){var j=a[h],k=b(j);f>k&&(i=h)}if(d>g){var l=a[g],m=b(l);m<(null===i?f:b(a[h]))&&(i=g)}if(null===i)break;a[c]=a[i],a[i]=e,c=i}}function e(a){if(a&&!angular.isFunction(a))throw new Error("DSBinaryHeap(weightFunc): weightFunc: must be a function!");a=a||function(a){return a},this.weightFunc=a,this.heap=[]}function f(){this.$get=function(){return e}}e.prototype.push=function(a){this.heap.push(a),c(this.heap,this.weightFunc,this.heap.length-1)},e.prototype.peek=function(){return this.heap[0]},e.prototype.pop=function(){var a=this.heap[0],b=this.heap.pop();return this.heap.length>0&&(this.heap[0]=b,d(this.heap,this.weightFunc,0)),a},e.prototype.remove=function(a){for(var b=this.heap.length,e=0;b>e;e++)if(angular.equals(this.heap[e],a)){var f=this.heap[e],g=this.heap.pop();return e!==b-1&&(this.heap[e]=g,c(this.heap,this.weightFunc,e),d(this.heap,this.weightFunc,e)),f}return null},e.prototype.removeAll=function(){this.heap=[]},e.prototype.size=function(){return this.heap.length},b.exports={DSBinaryHeapProvider:f,DSBinaryHeap:e}},{}],2:[function(a,b){b.exports=function(){clearInterval(this.$$cacheFlushIntervalId),clearInterval(this.$$recycleFreqId),this.removeAll(),this.$$storage&&(this.$$storage.removeItem(this.$$prefix+".keys"),this.$$storage.removeItem(this.$$prefix)),this.$$storage=null,this.$$data=null,this.$$lruHeap=null,this.$$expiresHeap=null,this.$$prefix=null}},{}],3:[function(a,b){var c=a("../utils");b.exports=function(a,b){var d=this;if(angular.isArray(a)){var e=a,f=[];return angular.forEach(e,function(a){var c=d.get(a,b);null!==c&&void 0!==c&&f.push(c)}),f}if(a=c.stringifyNumber(a),!this.$$disabled){if(b=b||{},!angular.isString(a))throw angular.$$minErr("ng")("areq","Expected key to be a string! Found: {0}.",typeof a);if(b&&!angular.isObject(b))throw angular.$$minErr("ng")("areq","Expected options to be an object! Found: {0}.",typeof b);if(b.onExpire&&!angular.isFunction(b.onExpire))throw angular.$$minErr("ng")("areq","Expected options.onExpire to be a function! Found: {0}.",typeof b.onExpire);var g;if(this.$$storage){var h=this.$$storage.getItem(this.$$prefix+".data."+a);if(!h)return;g=angular.fromJson(h)}else{if(!(a in this.$$data))return;g=this.$$data[a]}var i=g.value,j=(new Date).getTime();return this.$$storage?(this.$$lruHeap.remove({key:a,accessed:g.accessed}),g.accessed=j,this.$$lruHeap.push({key:a,accessed:j})):(this.$$lruHeap.remove(g),g.accessed=j,this.$$lruHeap.push(g)),"passive"===this.$$deleteOnExpire&&"expires"in g&&g.expires<j?(this.remove(a),this.$$onExpire?this.$$onExpire(a,g.value,b.onExpire):b.onExpire&&b.onExpire(a,g.value),i=void 0):this.$$storage&&this.$$storage.setItem(this.$$prefix+".data."+a,angular.toJson(g)),i}}},{"../utils":21}],4:[function(a,b){function c(a,b){if(!angular.isString(a))throw angular.$$minErr("ng")("areq","Expected storageMode to be a string! Found: {0}.",typeof a);if("memory"!==a&&"localStorage"!==a&&"sessionStorage"!==a)throw angular.$$minErr("ng")("areq",'Expected storageMode to be "memory", "localStorage" or "sessionStorage"! Found: {0}.',a);if(this.$$storageMode=a,b){if(!angular.isObject(b))throw angular.$$minErr("ng")("areq","Expected storageImpl to be an object! Found: {0}.",typeof b);if(!("setItem"in b&&"function"==typeof b.setItem))throw angular.$$minErr("ng")("areq",'Expected storageImpl to implement "setItem(key, value)"! Found: {0}.',typeof b.setItem);if(!("getItem"in b&&"function"==typeof b.getItem))throw angular.$$minErr("ng")("areq",'Expected storageImpl to implement "getItem(key)"! Found: {0}.',typeof b.getItem);if(!("removeItem"in b)||"function"!=typeof b.removeItem)throw angular.$$minErr("ng")("areq",'Expected storageImpl to implement "removeItem(key)"! Found: {0}.',typeof b.removeItem);this.$$storage=b}else if("localStorage"===this.$$storageMode)try{localStorage.setItem("angular-cache","angular-cache"),localStorage.removeItem("angular-cache"),this.$$storage=localStorage}catch(c){delete this.$$storage,this.$$storageMode="memory"}else if("sessionStorage"===this.$$storageMode)try{sessionStorage.setItem("angular-cache","angular-cache"),sessionStorage.removeItem("angular-cache"),this.$$storage=sessionStorage}catch(c){delete this.$$storage,this.$$storageMode="memory"}}function d(a,b){if(a=a||{},b=!!b,!angular.isObject(a))throw angular.$$minErr("ng")("areq","Expected cacheOptions to be an object! Found: {0}.",typeof a);"disabled"in a?this.$$disabled=!!a.disabled:b&&delete this.$$disabled,"capacity"in a?this.setCapacity(a.capacity):b&&this.setCapacity(null),"deleteOnExpire"in a?this.setDeleteOnExpire(a.deleteOnExpire):b&&this.setDeleteOnExpire(null),"maxAge"in a?this.setMaxAge(a.maxAge):b&&this.setMaxAge(null),"recycleFreq"in a?this.setRecycleFreq(a.recycleFreq):b&&this.setRecycleFreq(null),"cacheFlushInterval"in a?this.setCacheFlushInterval(a.cacheFlushInterval):b&&this.setCacheFlushInterval(null),"onExpire"in a?this.setOnExpire(a.onExpire):b&&this.setOnExpire(null)}function e(a,b){this.$$data={},this.$$id=a,this.$$storage=null,this.$$expiresHeap=new g(function(a){return a.expires}),this.$$lruHeap=new g(function(a){return a.accessed}),b=b||{},"storageMode"in b&&c.apply(this,[b.storageMode,b.storageImpl]),"storagePrefix"in b&&(this.$$storagePrefix=b.storagePrefix),this.$$prefix=this.$$storagePrefix+a,d.apply(this,[b,!0])}var f=a("../defaults"),g=a("../DSBinaryHeap").DSBinaryHeap;for(var h in f.defaults)e.prototype["$$"+h]=f.defaults[h];e.prototype.setOptions=d,e.prototype.setCapacity=a("./setCapacity"),e.prototype.setDeleteOnExpire=a("./setDeleteOnExpire"),e.prototype.setMaxAge=a("./setMaxAge"),e.prototype.setRecycleFreq=a("./setRecycleFreq"),e.prototype.setCacheFlushInterval=a("./setCacheFlushInterval"),e.prototype.setOnExpire=a("./setOnExpire"),e.prototype.put=a("./put"),e.prototype.get=a("./get"),e.prototype.remove=a("./remove"),e.prototype.removeAll=a("./removeAll"),e.prototype.removeExpired=a("./removeExpired"),e.prototype.destroy=a("./destroy"),e.prototype.info=a("./info"),e.prototype.keySet=a("./keySet"),e.prototype.keys=a("./keys"),e.prototype.disable=function(){this.$$disabled=!0},e.prototype.enable=function(){delete this.$$disabled},e.prototype.touch=function(a){if(a){var b=this,c=this.get(a,{onExpire:function(a,c){b.put(a,c)}});c&&this.put(a,c)}else for(var d=this.keys(),e=0;e<d.length;e++)this.touch(d[e])},b.exports=e},{"../DSBinaryHeap":1,"../defaults":19,"./destroy":2,"./get":3,"./info":5,"./keySet":6,"./keys":7,"./put":8,"./remove":9,"./removeAll":10,"./removeExpired":11,"./setCacheFlushInterval":12,"./setCapacity":13,"./setDeleteOnExpire":14,"./setMaxAge":15,"./setOnExpire":16,"./setRecycleFreq":17}],5:[function(a,b){b.exports=function(a){if(a){var b;if(this.$$storage){var c=this.$$storage.getItem(this.$$prefix+".data."+a);return c?(b=angular.fromJson(c),{created:b.created,accessed:b.accessed,expires:b.expires,isExpired:(new Date).getTime()-b.created>this.$$maxAge}):void 0}return a in this.$$data?(b=this.$$data[a],{created:b.created,accessed:b.accessed,expires:b.expires,isExpired:(new Date).getTime()-b.created>this.$$maxAge}):void 0}return{id:this.$$id,capacity:this.$$capacity,maxAge:this.$$maxAge,deleteOnExpire:this.$$deleteOnExpire,onExpire:this.$$onExpire,cacheFlushInterval:this.$$cacheFlushInterval,recycleFreq:this.$$recycleFreq,storageMode:this.$$storageMode,storageImpl:this.$$storage,disabled:this.$$disabled,size:this.$$lruHeap&&this.$$lruHeap.size()||0}}},{}],6:[function(a,b){var c=a("../utils");b.exports=function(){if(this.$$storage){var a=this.$$storage.getItem(this.$$prefix+".keys"),b={};if(a)for(var d=angular.fromJson(a),e=0;e<d.length;e++)b[d[e]]=d[e];return b}return c.keySet(this.$$data)}},{"../utils":21}],7:[function(a,b){var c=a("../utils");b.exports=function(){if(this.$$storage){var a=this.$$storage.getItem(this.$$prefix+".keys");return a?angular.fromJson(a):[]}return c.keys(this.$$data)}},{"../utils":21}],8:[function(a,b){var c=a("../utils");b.exports=function(a,b){var d=this;if(!this.$$disabled&&null!==b&&void 0!==b){if(b&&b.then)return void b.then(function(b){angular.isObject(b)&&"status"in b&&"data"in b?d.put(a,[b.status,b.data,b.headers(),b.statusText]):d.put(a,b)});if(a=c.stringifyNumber(a),!angular.isString(a))throw angular.$$minErr("ng")("areq","Expected key to be a string! Found: {0}.",typeof a);var e=(new Date).getTime(),f={key:a,value:b,created:e,accessed:e};if(f.expires=f.created+this.$$maxAge,this.$$storage){var g=this.$$storage.getItem(this.$$prefix+".keys"),h=g?angular.fromJson(g):[],i=this.$$storage.getItem(this.$$prefix+".data."+a);i&&this.remove(a),this.$$expiresHeap.push({key:a,expires:f.expires}),this.$$lruHeap.push({key:a,accessed:f.accessed}),this.$$storage.setItem(this.$$prefix+".data."+a,angular.toJson(f));for(var j=!1,k=0;k<h.length;k++)if(h[k]===a){j=!0;break}j||h.push(a),this.$$storage.setItem(this.$$prefix+".keys",angular.toJson(h))}else this.$$data[a]&&this.remove(a),this.$$expiresHeap.push(f),this.$$lruHeap.push(f),this.$$data[a]=f;return this.$$lruHeap.size()>this.$$capacity&&this.remove(this.$$lruHeap.peek().key),b}}},{"../utils":21}],9:[function(a,b){b.exports=function(a){if(!this.$$storage){var b=this.$$data[a]?this.$$data[a].value:void 0;return this.$$lruHeap.remove(this.$$data[a]),this.$$expiresHeap.remove(this.$$data[a]),this.$$data[a]=null,delete this.$$data[a],b}var c=this.$$storage.getItem(this.$$prefix+".data."+a);if(c){var d=angular.fromJson(c);this.$$lruHeap.remove({key:a,accessed:d.accessed}),this.$$expiresHeap.remove({key:a,expires:d.expires}),this.$$storage.removeItem(this.$$prefix+".data."+a);var e=this.$$storage.getItem(this.$$prefix+".keys"),f=e?angular.fromJson(e):[],g=f.indexOf(a);return g>=0&&f.splice(g,1),this.$$storage.setItem(this.$$prefix+".keys",angular.toJson(f)),d.value}}},{}],10:[function(a,b){b.exports=function(){if(this.$$storage){this.$$lruHeap.removeAll(),this.$$expiresHeap.removeAll();var a=this.$$storage.getItem(this.$$prefix+".keys");if(a)for(var b=angular.fromJson(a),c=0;c<b.length;c++)this.remove(b[c]);this.$$storage.setItem(this.$$prefix+".keys",angular.toJson([]))}else{this.$$lruHeap.removeAll(),this.$$expiresHeap.removeAll();for(var d in this.$$data)this.$$data[d]=null;this.$$data={}}}},{}],11:[function(a,b){b.exports=function(){for(var a,b,c=(new Date).getTime(),d={};(b=this.$$expiresHeap.peek())&&b.expires<c;)d[b.key]=b.value?b.value:null,this.$$expiresHeap.pop();if(this.$$storage)for(a in d){var e=this.$$storage.getItem(this.$$prefix+".data."+a);e&&(d[a]=angular.fromJson(e).value,this.remove(a))}else for(a in d)this.remove(a);if(this.$$onExpire)for(a in d)this.$$onExpire(a,d[a]);return d}},{}],12:[function(a,b){b.exports=function(a){if(null===a)delete this.$$cacheFlushInterval;else{if(!angular.isNumber(a))throw angular.$$minErr("ng")("areq","Expected cacheFlushInterval to be a number! Found: {0}.",typeof a);if(0>a)throw angular.$$minErr("ng")("areq","Expected cacheFlushInterval to be greater than zero! Found: {0}.",a);a!==this.$$cacheFlushInterval&&(this.$$cacheFlushInterval=a,clearInterval(this.$$cacheFlushIntervalId),function(a){a.$$cacheFlushIntervalId=setInterval(function(){a.removeAll()},a.$$cacheFlushInterval)}(this))}}},{}],13:[function(a,b){b.exports=function(a){if(null===a)delete this.$$capacity;else{if(!angular.isNumber(a))throw angular.$$minErr("ng")("areq","Expected capacity to be a number! Found: {0}.",typeof a);if(0>a)throw angular.$$minErr("ng")("areq","Expected capacity to be greater than zero! Found: {0}.",a);this.$$capacity=a}for(var b={};this.$$lruHeap.size()>this.$$capacity;)b[this.$$lruHeap.peek().key]=this.remove(this.$$lruHeap.peek().key);return b}},{}],14:[function(a,b){b.exports=function(a){if(null===a)delete this.$$deleteOnExpire;else{if(!angular.isString(a))throw angular.$$minErr("ng")("areq","Expected deleteOnExpire to be a string! Found: {0}.",typeof a);if("none"!==a&&"passive"!==a&&"aggressive"!==a)throw angular.$$minErr("ng")("areq",'Expected deleteOnExpire to be "none", "passive" or "aggressive"! Found: {0}.',a);this.$$deleteOnExpire=a}this.setRecycleFreq(this.$$recycleFreq)}},{}],15:[function(a,b){var c=a("../utils");b.exports=function(a){if(null===a)delete this.$$maxAge;else{if(!angular.isNumber(a))throw angular.$$minErr("ng")("areq","Expected maxAge to be a number! Found: {0}.",typeof a);if(0>a)throw angular.$$minErr("ng")("areq","Expected maxAge to be greater than zero! Found: {0}.",a);this.$$maxAge=a}var b,d,e;if(this.$$expiresHeap.removeAll(),this.$$storage){var f=this.$$storage.getItem(this.$$prefix+".keys");for(d=f?angular.fromJson(f):[],b=0;b<d.length;b++){e=d[b];var g=this.$$storage.getItem(this.$$prefix+".data."+e);if(g){var h=angular.fromJson(g);h.expires=this.$$maxAge===Number.MAX_VALUE?Number.MAX_VALUE:h.created+this.$$maxAge,this.$$expiresHeap.push({key:e,expires:h.expires})}}}else for(d=c.keys(this.$$data),b=0;b<d.length;b++)e=d[b],this.$$data[e].expires=this.$$maxAge===Number.MAX_VALUE?Number.MAX_VALUE:this.$$data[e].created+this.$$maxAge,this.$$expiresHeap.push(this.$$data[e]);return"aggressive"===this.$$deleteOnExpire?this.removeExpired():{}}},{"../utils":21}],16:[function(a,b){b.exports=function(a){if(null===a)delete this.$$onExpire;else{if(!angular.isFunction(a))throw angular.$$minErr("ng")("areq","Expected onExpire to be a function! Found: {0}.",typeof a);this.$$onExpire=a}}},{}],17:[function(a,b){b.exports=function(a){if(null===a)delete this.$$recycleFreq;else{if(!angular.isNumber(a))throw angular.$$minErr("ng")("areq","Expected recycleFreq to be a number! Found: {0}.",typeof a);if(0>a)throw angular.$$minErr("ng")("areq","Expected recycleFreq to be greater than zero! Found: {0}.",a);this.$$recycleFreq=a}clearInterval(this.$$recycleFreqId),"aggressive"===this.$$deleteOnExpire?!function(a){a.$$recycleFreqId=setInterval(function(){a.removeExpired()},a.$$recycleFreq)}(this):delete this.$$recycleFreqId}},{}],18:[function(a,b){function c(){var a=new d.Config;this.version=f,this.setCacheDefaults=function(b){if(b=b||{},!angular.isObject(b))throw angular.$$minErr("ng")("areq","Expected options to be an object! Found: {0}.",typeof b);for(var c in d.defaults)c in b&&(a[c]=b[c]);"disabled"in b&&(a.$$disabled=!!b.disabled)},this.$get=function(){function b(a){var b,c=[];for(b in a)a.hasOwnProperty(b)&&c.push(b);return c}function c(b,c){if(b in h)throw angular.$$minErr("$cacheFactory")("iid","CacheId '{0}' is already taken!",b);if(!angular.isString(b))throw angular.$$minErr("ng")("areq","Expected cacheId to be a string! Found: {0}.",typeof b);return h[b]=new e(b,angular.extend({},a,c)),h[b].destroy=function(){this.constructor.prototype.destroy.call(this),delete h[this.$$id]},h[b]}function g(a,b){return c(a,b)}var h={};return g.createCache=c,g.version=f,g.info=function(){for(var c=b(h),e={size:c.length,caches:{}},f=0;f<c.length;f++){var g=c[f];e.caches[g]=h[g].info()}var i=e.cacheDefaults=angular.extend({},a);for(var j in d.defaults)j in i||(i[j]=a["$$"+j]);return e},g.get=function(a){if(!angular.isString(a))throw angular.$$minErr("ng")("areq","Expected cacheId to be a string! Found: {0}.",typeof a);return h[a]},g.keySet=function(){var a,b={};for(a in h)h.hasOwnProperty(a)&&(b[a]=a);return b},g.keys=function(){return b(h)},g.destroyAll=function(){for(var a in h)h[a].destroy();h={}},g.clearAll=function(){for(var a in h)h[a].removeAll()},g.enableAll=function(){for(var a in h)h[a].$$disabled=!1},g.disableAll=function(){for(var a in h)h[a].$$disabled=!0},g}}var d=a("../defaults"),e=a("../DSCache"),f="3.1.1";b.exports=c},{"../DSCache":4,"../defaults":19}],19:[function(a,b){function c(){}var d={capacity:Number.MAX_VALUE,maxAge:Number.MAX_VALUE,deleteOnExpire:"none",onExpire:null,cacheFlushInterval:null,recycleFreq:1e3,storageMode:"memory",storageImpl:null,disabled:!1,storagePrefix:"angular-cache.caches."};for(var e in d)c.prototype["$$"+e]=d[e];b.exports={Config:c,defaults:d}},{}],20:[function(a){!function(b,c){"use strict";c.$$minErr=c.$$minErr||function(a){return function(){var b,d,e=arguments[0],f="["+(a?a+":":"")+e+"] ",g=arguments[1],h=arguments,i=function(a){return"function"==typeof a?a.toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof a?"undefined":"string"!=typeof a?JSON.stringify(a):a};for(b=f+g.replace(/\{\d+\}/g,function(a){var b,d=+a.slice(1,-1);return d+2<h.length?(b=h[d+2],"function"==typeof b?b.toString().replace(/ ?\{[\s\S]*$/,""):"undefined"==typeof b?"undefined":"string"!=typeof b?c.toJson(b):b):a}),b=b+"\nhttp://errors.angularjs.org/"+c.version.full+"/"+(a?a+"/":"")+e,d=2;d<arguments.length;d++)b=b+(2==d?"?":"&")+"p"+(d-2)+"="+encodeURIComponent(i(arguments[d]));return new Error(b)}},c.module("angular-data.DSBinaryHeap",[]).provider("DSBinaryHeap",a("./DSBinaryHeap").DSBinaryHeapProvider),c.module("angular-data.DSCacheFactory",["ng","angular-data.DSBinaryHeap"]).provider("DSCacheFactory",a("./DSCacheFactory"))}(window,window.angular)},{"./DSBinaryHeap":1,"./DSCacheFactory":18}],21:[function(a,b){b.exports={stringifyNumber:function(a){return a&&angular.isNumber(a)?a.toString():a},keySet:function(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&(c[b]=b);return c},keys:function(a){var b,c=[];for(b in a)a.hasOwnProperty(b)&&c.push(b);return c}}},{}]},{},[20]);
//# sourceMappingURL=angular-cache.min.map