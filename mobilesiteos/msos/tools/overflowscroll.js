// Copyright Notice:
//			    tools/overflowscroll.js
//			 Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.tools.overflowscroll");

msos.tools.overflowscroll.version = new msos.set_version(13, 6, 14);


msos.tools.overflowscroll.available = function () {
    "use strict";

    var temp_toa = 'msos.tools.overflowscroll.available -> ',
        prefixes = ['webkit', 'moz', 'o', 'ms'],
        div = document.createElement('div'),
        body = msos.body,
        hasIt = false,
        i = 0,
        prefix = '',
        computedStyle = null;

    msos.console.debug(temp_toa + 'start.');

    body.appendChild(div);

    for (i = 0; i < prefixes.length; i += 1) {
        prefix = prefixes[i];
        div.style[prefix + 'OverflowScrolling'] = 'touch';
    }

    // And the non-prefixed property
    div.style.overflowScrolling = 'touch';

    // Now check the properties
    computedStyle = window.getComputedStyle(div);

    // First non-prefixed
    hasIt = !!computedStyle.overflowScrolling;

    // Now prefixed...
    for (i = 0; i < prefixes.length; i += 1) {
        prefix = prefixes[i];
        if (!!computedStyle[prefix + 'OverflowScrolling']) {
            hasIt = true;
            break;
        }
    }

    // Cleanup old div elements
    div.parentNode.removeChild(div);

    msos.console.debug(temp_toa + 'done, available: ' + hasIt);
    return hasIt;
};