// Copyright Notice:
//				    auto.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// Autosize textareas

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.auto");

msos.auto.version = new msos.set_version(13, 6, 14);


// Based on Autogrow
// http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series.html
msos.auto.grow = function () {
    "use strict";

    var temp_grw = 'msos.auto.grow -> ';

    msos.console.debug(temp_grw + 'start.');

    function add_event(idx, grow_ta) {

        var setLineHeight = parseInt(jQuery(grow_ta).css('line-height'), 10) || 12,
            textLineHeight = grow_ta.currentStyle ? grow_ta.currentStyle.lineHeight : window.getComputedStyle(grow_ta, null).lineHeight;

        textLineHeight = (textLineHeight.indexOf("px") === -1) ? setLineHeight : parseInt(textLineHeight, 10);

        function on_keyup() {
            var newHeight = grow_ta.scrollHeight,
                currentHeight = grow_ta.clientHeight;

            if (newHeight > currentHeight) {
                grow_ta.style.height = String(newHeight + 3 * textLineHeight) + "px";
            }
        }

        jQuery(grow_ta).css('overflow', 'hidden');
        jQuery(grow_ta).bind('keyup', on_keyup);

        msos.console.debug(temp_grw + 'added: ' + (grow_ta.id || grow_ta.name || 'textarea ' + idx) + ' textarea');
    }

    jQuery('textarea').each(add_event);

    msos.console.debug(temp_grw + 'done!');
};


msos.onload_functions.push(msos.auto.grow);