// Copyright Notice:
//				    insert.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile, Detection of a DOM element insertion into a DOM parent

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.detect.insert");

msos.detect.insert.version = new msos.set_version(13, 6, 14);


// Start by loading our pop_ajax.css stylesheet
msos.detect.insert.css = new msos.loader();
msos.detect.insert.css.load('detect_insert_css', msos.resource_url('css', 'detect_insert.css'));


msos.detect.insert.assign = function (selector) {
    "use strict";

    var temp_dia = 'msos.detect.insert.assign -> ',
        styleElement = document.createElement("style"),
        css_text = selector + ' {' +
            'animation-duration: 0.001s;' +
            '-o-animation-duration: 0.001s;' +
            '-ms-animation-duration: 0.001s;' +
            '-moz-animation-duration: 0.001s;' +
            '-webkit-animation-duration: 0.001s;' +
            'animation-name: nodeInserted;' +
            '-o-animation-name: nodeInserted;' +
            '-ms-animation-name: nodeInserted;' +   
            '-moz-animation-name: nodeInserted;' +
            '-webkit-animation-name: nodeInserted;' +
        '}',
        insertListener = function (event) {
            if (event.animationName == "nodeInserted") {
                msos.console.warn(temp_dia + 'node inserted: ', event);
            }
        };

    msos.console.debug(temp_dia + 'start.');

    styleElement.type = "text/css";

    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = css_text;
    } else {
        styleElement.appendChild(document.createTextNode(css_text));
    }

    document.getElementsByTagName("head")[0].appendChild(styleElement);

    document.addEventListener("animationstart",         insertListener, false); // standard + firefox
    document.addEventListener("MSAnimationStart",       insertListener, false); // IE
    document.addEventListener("webkitAnimationStart",   insertListener, false); // Chrome + Safari

    msos.console.debug(temp_dia + 'done!');
};



