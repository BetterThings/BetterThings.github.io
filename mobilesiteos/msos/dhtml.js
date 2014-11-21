// Copyright Notice:
//				    dhtml.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile dhtml functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.dhtml");

msos.dhtml.version = new msos.set_version(13, 6, 14);


// --------------------------
// Image Switching Function
// --------------------------
msos.dhtml.switch_img_onmouseover = function (targ_img, orig_img, over_img) {
    "use strict";

    var func_txt = 'msos.dhtml.switch_img_onmouseover -> ',
        pattern = null,
        orig_src = '',
        over_src = '';

    if (!targ_img || !targ_img.src) {
        msos.console.error(func_txt + 'No image specified!');
        return;
    }

    if (msos.config.browser.touch) {
        jQuery(targ_img).css(
            {
                '-webkit-user-select': 'none',
                '-webkit-touch-callout': 'none'
            }
        );
    }

    pattern = new RegExp(orig_img);
    orig_src = targ_img.src;
    over_src = orig_src.replace(pattern, over_img);

    jQuery(targ_img).on(
        'mouseover touchstart',
        function (evt) {
            msos.do_nothing(evt);
            targ_img.src = over_src;
            var temp_txt = func_txt + "\n" + targ_img.src;
            if (msos.debug) {
                msos.debug.event(evt, temp_txt);
            }
        }
    );

    jQuery(targ_img).mouseout(
        'mouseout touchend',
        function (evt) {
            msos.do_nothing(evt);
            targ_img.src = orig_src;
            var temp_txt = func_txt + "\n" + targ_img.src;
            if (msos.debug) {
                msos.debug.event(evt, temp_txt);
            }
        }
    );

    if (orig_src === over_src) {
        msos.console.error(func_txt + 'Switch Image failed!');
    }
};