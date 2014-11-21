// Copyright Notice:
//				    style.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile style && CSS functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.style");

msos.style.version = new msos.set_version(13, 12, 13);


msos.style.computed = function (element) {
    "use strict";

    var temp_stl = 'msos.style.computed -> ',
        method = '',
        cs = {},
        styles = {},
        k = '';

    if (msos.config.verbose) {
        msos.console.debug(temp_stl + 'start.');
    }

    if (element.nodeType !== 1) {
        msos.console.error(temp_stl + 'failed: argument is not a DOM node!');
        return styles;
    }

    // The DOM Level 2 CSS way
    if (window.getComputedStyle) {
        cs = document.defaultView.getComputedStyle(element, null);
        for (k in cs) {
            styles[k] = cs.getPropertyValue(k);
        }
        method = 'getComputedStyle';
        // IE way (must be last - Opera has both, but returns [])
    }
    else if (element.currentStyle) {
        cs = element.currentStyle || {};
        for (k in cs) {
            styles[k] = cs[k];
        }
        method = 'currentStyle';
    }

    if (msos.config.verbose) {
        msos.console.debug(temp_stl + 'done, method: ' + method);
    }
    return styles;
};