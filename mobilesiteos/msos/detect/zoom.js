/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector
 * Version 1.0.4 | Apr 1 2013
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 */

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.detect.zoom");

msos.detect.zoom.version = new msos.set_version(13, 10, 18);


msos.detect.zoom.current = function () {

    var devicePixelRatio = function () {
            return window.devicePixelRatio || 1;
        },
        fallback = function () {
            return {
                zoom: 1,
                devicePxPerCssPx: 1
            };
        },
        ie8 = function () {
            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * devicePixelRatio()
            };
        },
        ie10 = function () {
            var zoom = Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * devicePixelRatio()
            };
        },
        webkitMobile = function () {
            var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;
            var zoom = deviceWidth / window.innerWidth;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * devicePixelRatio()
            };
        },
        webkit = function () {
            var important = function (str) {
                return str.replace(/;/g, " !important;");
            };

            var div = document.createElement('div');
            div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
            div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));

            var container = document.createElement('div');
            container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
            container.appendChild(div);

            document.body.appendChild(container);
            var zoom = 1000 / div.clientHeight;
            zoom = Math.round(zoom * 100) / 100;
            document.body.removeChild(container);

            return{
                zoom: zoom,
                devicePxPerCssPx: zoom * devicePixelRatio()
            };
        },
        firefox4 = function () {
            var zoom = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
            zoom = Math.round(zoom * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom
            };
        },
        firefox18 = function () {
            return {
                zoom: firefox4().zoom,
                devicePxPerCssPx: devicePixelRatio()
            };
        },
        opera11 = function () {
            var zoom = window.top.outerWidth / window.top.innerWidth;
            zoom = Math.round(zoom * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * devicePixelRatio()
            };
        },
        mediaQueryBinarySearch = function (property, unit, a, b, maxIter, epsilon) {
            var matchMedia;
            var head, style, div;
            if (window.matchMedia) {
                matchMedia = window.matchMedia;
            } else {
                head = document.getElementsByTagName('head')[0];
                style = document.createElement('style');
                head.appendChild(style);
    
                div = document.createElement('div');
                div.className = 'mediaQueryBinarySearch';
                div.style.display = 'none';
                document.body.appendChild(div);
    
                matchMedia = function (query) {
                    style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
                    var matched = getComputedStyle(div, null).textDecoration == 'underline';
                    style.sheet.deleteRule(0);
                    return {matches: matched};
                };
            }
            var ratio = binarySearch(a, b, maxIter);
            if (div) {
                head.removeChild(style);
                document.body.removeChild(div);
            }
            return ratio;

            function binarySearch(a, b, maxIter) {
                var mid = (a + b) / 2;
                if (maxIter <= 0 || b - a < epsilon) {
                    return mid;
                }
                var query = "(" + property + ":" + mid + unit + ")";
                if (matchMedia(query).matches) {
                    return binarySearch(mid, b, maxIter - 1);
                } else {
                    return binarySearch(a, mid, maxIter - 1);
                }
            }
        },
        detectFunction = (function () {
            var func = fallback;
            //IE8+
            if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                func = ie8;
            }
            // IE10+ / Touch
            else if (window.navigator.msMaxTouchPoints) {
                func = ie10;
            }
            //Mobile Webkit
            else if ('orientation' in window && typeof document.body.style.webkitMarquee === 'string') {
                func = webkitMobile;
            }
            //WebKit
            else if (typeof document.body.style.webkitMarquee === 'string') {
                func = webkit;
            }
            //Opera
            else if (navigator.userAgent.indexOf('Opera') !== -1) {
                func = opera11;
            }
            //Last one is Firefox
            //FF 18.x
            else if (window.devicePixelRatio) {
                func = firefox18;
            }
            //FF 4.0 - 17.x
            else if (firefox4().zoom > 0.001) {
                func = firefox4;
            }
    
            return func;
        }());


    return ({

        zoom: function () {
            return detectFunction().zoom;
        },
        device: function () {
            return detectFunction().devicePxPerCssPx;
        }
    });
};
