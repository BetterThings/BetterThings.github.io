/**
 * Angular Carousel - Mobile friendly touch carousel for AngularJS
 * @version v0.2.2 - 2014-04-02
 * @link http://revolunet.github.com/angular-carousel
 * @author Julien Bouquillon <julien@revolunet.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

msos.provide("ng.ui.carousel");
msos.require("ng.mobile.touch");

ng.ui.carousel.version = new msos.set_version(14, 7, 31);


// Start by loading our carousel.css stylesheet
ng.ui.carousel.css = new msos.loader();
ng.ui.carousel.css.load('ng_ui_css_carousel',   msos.resource_url('ng', 'ui/css/carousel.css'));

// Below is the standard angular-carousel code, except angular-carousel -> ng.ui.carousel and ngTouch -> ng.mobile.touch
angular.module("ng.ui.carousel",["ng.mobile.touch"]),angular.module("ng.ui.carousel").directive("rnCarouselControls",[function(){return{restrict:"A",replace:!0,scope:{items:"=",index:"="},link:function(a){a.prev=function(){a.index--},a.next=function(){a.index++}},template:'<div class="rn-carousel-controls"><span class="rn-carousel-control rn-carousel-control-prev" ng-click="prev()" ng-if="index > 0"></span><span class="rn-carousel-control rn-carousel-control-next" ng-click="next()" ng-if="index < items.length - 1"></span></div>'}}]),angular.module("ng.ui.carousel").directive("rnCarouselIndicators",[function(){return{restrict:"A",replace:!0,scope:{items:"=",index:"="},template:'<div class="rn-carousel-indicator"><span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{active: $index==$parent.index}"></span></div>'}}]),function(){"use strict";angular.module("ng.ui.carousel").directive("rnCarousel",["$swipe","$window","$document","$parse","$compile","$rootScope",function(a,b,c,d,e,f){var g=0,h=75,i=.05,j=3,k=b.requestAnimationFrame||b.webkitRequestAnimationFrame||b.mozRequestAnimationFrame;return{restrict:"A",scope:!0,compile:function(l,m){var n,o,p=l.children()[0].attributes,q=!1,r=!1,s=!1;return l.addClass("rn-carousel-slides"),l.children().addClass("rn-carousel-slide"),["ng-repeat","data-ng-repeat","x-ng-repeat"].every(function(a){var b=p[a];if(angular.isDefined(b)){var c=b.value.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),d=c[3];if(n=c[1],o=c[2],n)return angular.isDefined(m.rnCarouselBuffered)&&(r=!0,b.value=n+" in "+o+"|carouselSlice:carouselBufferIndex:carouselBufferSize",d&&(b.value+=" track by "+d)),q=!0,!1}return!0}),function(l,m,n){function p(){for(var a=[],b=0;Q>b;b++)a[b]=b;l.carouselIndicatorArray=a}function t(){var a=S.children();return I=0===a.length?S[0].getBoundingClientRect().width:a[0].getBoundingClientRect().width}function u(){T.css("width","100%");var a=t();a&&T.css("width",a+"px")}function v(a){isNaN(a)&&(a=l.carouselIndex*I),P=a;var b=-Math.round(P);b+=l.carouselBufferIndex*I,S[0].style[J]=Y?"translate3d("+b+"px, 0, 0)":"translate("+b+"px, 0)"}function w(){var a,b;M&&(a=Date.now()-O,b=M*Math.exp(-a/h),b>j||-j>b?(v(N-b),k(w)):z(N/I))}function x(a){return a>=Q?Q:0>=a?0:a}function y(){var a=0,b=(l.carouselBufferSize-1)/2;r&&(a=l.carouselIndex<=b?0:Q<l.carouselBufferSize?0:l.carouselIndex>Q-l.carouselBufferSize?Q-l.carouselBufferSize:l.carouselIndex-b),l.carouselBufferIndex=a}function z(a,b){return isNaN(a)&&(a=l.carouselIndex),b?(P=a*I,void F(null,null,!0)):(l.carouselIndex=x(a),y(),"$apply"!==f.$$phase&&"$digest"!==f.$$phase&&(s?l.$apply():l.$digest()),void v())}function A(){return i*I}function B(a){R=!0,F({x:a.clientX,y:a.clientY},a)}function C(a){var b=a;return 0===l.carouselIndex?b=Math.max(-A(),b):l.carouselIndex===Q-1&&(b=Math.min((Q-1)*I+A(),b)),b}function D(a){return c.bind("mouseup",B),K=!0,L=a.x,M=0,O=Date.now(),!1}function E(a){var b,c;return K&&(b=a.x,c=L-b,(c>2||-2>c)&&(R=!0,L=b,k(function(){v(C(P+c))}))),!1}function F(a,b,d){if(!b||R){c.unbind("mouseup",B),K=!1,R=!1,N=P;var e=A(),f=l.carouselIndex*I,g=f-N,h=-Math[g>=0?"ceil":"floor"](g/I),i=Math.abs(g)>e;h+l.carouselIndex>=Q&&(h=Q-1-l.carouselIndex),h+l.carouselIndex<0&&(h=-l.carouselIndex);var j=i?h:0;return N=(j+l.carouselIndex)*I,M=N-P,O=Date.now(),d&&(M=P-f),k(w),!1}}function G(){var a,b=document.createElement("p"),c={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.insertBefore(b,null);for(var d in c)void 0!==b.style[d]&&(b.style[d]="translate3d(1px,1px,1px)",a=window.getComputedStyle(b).getPropertyValue(c[d]));return document.body.removeChild(b),void 0!==a&&a.length>0&&"none"!==a}function H(){u(),z()}g++;var I,J,K,L,M,N,O,P=0,Q=0,R=!1,S=m.wrap("<div id='carousel-"+g+"' class='rn-carousel-container'></div>"),T=S.parent();if((angular.isDefined(n.rnCarouselIndicator)||angular.isDefined(n.rnCarouselControl))&&(p(),l.$watch("carouselIndex",function(a){l.indicatorIndex=a}),l.$watch("indicatorIndex",function(a){z(a,!0)})),angular.isDefined(n.rnCarouselIndicator)){var U=e("<div id='carousel-"+g+"-indicator' index='indicatorIndex' items='carouselIndicatorArray' rn-carousel-indicators class='rn-carousel-indicator'></div>")(l);T.append(U)}if(angular.isDefined(n.rnCarouselControl)){var V=e("<div id='carousel-"+g+"-controls' index='indicatorIndex' items='carouselIndicatorArray' rn-carousel-controls class='rn-carousel-controls'></div>")(l);T.append(V)}if(l.carouselBufferIndex=0,l.carouselBufferSize=5,l.carouselIndex=0,n.rnCarouselIndex){var W=function(a){X.assign(l.$parent,a)},X=d(n.rnCarouselIndex);angular.isFunction(X.assign)?(l.$watch("carouselIndex",function(a){W(a)}),l.carouselIndex=X(l),l.$parent.$watch(X,function(a){void 0!==a&&(a>=Q?(a=Q-1,W(a)):0>a&&(a=0,W(a)),z(a,!0))}),s=!0):isNaN(n.rnCarouselIndex)||(l.carouselIndex=parseInt(n.rnCarouselIndex,10))}q?l.$watchCollection(o,function(a){Q=0,angular.isArray(a)?Q=a.length:angular.isObject(a)&&(Q=Object.keys(a).length),p(),I||u(),z(l.carouselIndex)}):(Q=m.children().length,p(),u()),n.$observe("rnCarouselSwipe",function(b){"false"!==b&&"off"!==b?a.bind(S,{start:D,move:E,end:F,cancel:function(a){F({},a)}}):S.unbind()}),s||z(l.carouselIndex),J="transform",["webkit","Moz","O","ms"].every(function(a){var b=a+"Transform";return"undefined"!=typeof document.body.style[b]?(J=b,!1):!0});var Y=G(),Z=angular.element(b);Z.bind("orientationchange",H),Z.bind("resize",H),l.$on("$destroy",function(){c.unbind("mouseup",B),Z.unbind("orientationchange",H),Z.unbind("resize",H)})}}}}])}(),function(){"use strict";angular.module("ng.ui.carousel").filter("carouselSlice",function(){return function(a,b,c){return angular.isArray(a)?a.slice(b,b+c):angular.isObject(a)?a:void 0}})}();