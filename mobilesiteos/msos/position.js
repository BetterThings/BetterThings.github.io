// Copyright Notice:
//					position.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile position functions
	Updated and adapted code from Dojo 1.6.0 dojo.position() functions
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.position");
msos.require("msos.style");
msos.require("msos.browser");

msos.position.version = new msos.set_version(13, 12, 13);


msos.position.absolute = function (node, include_scroll) {
    "use strict";

    var ret = node.getBoundingClientRect(),
        ie_offset = null,
        offset = {},
        scroll = {};

    ret = {
        x: ret.left,
        y: ret.top,
        w: ret.right - ret.left,
        h: ret.bottom - ret.top
    };

    // I hate IE...
    if (msos.browser.is.IE) {

        ie_offset = function () {
            if (msos.browser.is.IE < 8) {
                var r = msos.docl.getBoundingClientRect(),
                    l = r.left,
                    t = r.top;

                return {
                    x: l < 0 ? 0 : l,
                    y: t < 0 ? 0 : t
                };
            }
            else {
                return {
                    x: 0,
                    y: 0
                };
            }
        };

        offset = ie_offset();
        ret.x -= offset.x + (msos.browser.is.Quirks ? msos.body.clientLeft + msos.body.offsetLeft : 0);
        ret.y -= offset.y + (msos.browser.is.Quirks ? msos.body.clientTop +  msos.body.offsetTop  : 0);
    }

    if (include_scroll) {
        scroll = msos.position.document_scroll();
        ret.x += scroll.x;
        ret.y += scroll.y;
    }

    return ret; // Object
};


// --------------------------
// Position helper functions
// --------------------------
msos.position.fix_ie_scroll_left = function (scrollLeft) {
    "use strict";

    if (msos.browser.is.IE < 8 && msos.config.browser.direction !== 'ltr') {
        return scrollLeft + msos.docl.clientWidth - msos.docl.scrollWidth;
    }
    else {
        return scrollLeft;
    }
};

msos.position.document_scroll = function () {
    "use strict";

    return window["pageXOffset"] ? {
        x: window.pageXOffset,
        y: window.pageYOffset
    } : {
        x: msos.position.fix_ie_scroll_left(msos.docl.scrollLeft),
        y: msos.docl.scrollTop || 0
    };
};

msos.position.margin_box = function (node) {
    "use strict";

    var comp_style = msos.style.computed(node),
        me = msos.position.get_margin_extent(node),
        l = node.offsetLeft - me.l,
        t = node.offsetTop - me.t,
        p = node.parentNode,
        sl = 0,
        st = 0,
        p_comp_style = null,
        be = null;

    if (msos.browser.is.Moz) {
        sl = parseInt(comp_style.left, 10);
        st = parseInt(comp_style.top, 10);

        if (!isNaN(sl) && !isNaN(st)) {
            l = sl;
            t = st;
        }
        else {
            if (p && p.style) {
                p_comp_style = msos.style.computed(p);
                if (p_comp_style.overflow !== "visible") {
                    be = msos.position.get_border_extent(p);
                    l += be.l;
                    t += be.t;
                }
            }
        }
    }
    else if (msos.browser.is.Opera || (msos.browser.is.IE > 7 && !msos.browser.is.Quirks)) {
        if (p) {
            be = msos.position.get_border_extent(p);
            l -= be.l;
            t -= be.t;
        }
    }
    return {
        l: l,
        t: t,
        w: node.offsetWidth + me.w,
        h: node.offsetHeight + me.h
    };
};

msos.position.get_margin_extent = function (node) {
    "use strict";

    var me_obj = {},
        node_name = node.id || node.nodeName,
        comp_style = msos.style.computed(node),
        parse_l = comp_style['margin-left']		|| comp_style['marginLeft']		|| 0,
        parse_t = comp_style['margin-top']		|| comp_style['marginTop']		|| 0,
        parse_r = comp_style['margin-right']	|| comp_style['marginRight']	|| 0,
        parse_b = comp_style['margin-bottom']	|| comp_style['marginBottom']	|| 0,
        l = parseInt(parse_l, 10) || 0,
        t = parseInt(parse_t, 10) || 0,
        r = parseInt(parse_r, 10) || 0,
        b = parseInt(parse_b, 10) || 0;

    if (msos.browser.is.WebKit && (comp_style.position !== "absolute")) {
        r = l;
    }

    me_obj = {
        l: l,
        t: t,
        w: l + r,
        h: t + b
    };

    if (msos.config.verbose) {
        msos.console.debug('msos.position.get_margin_extent -> for: ' + node_name, me_obj);
    }
    return me_obj;
};

msos.position.get_border_extent = function (node) {
    "use strict";

    var be_obj = {},
        node_name = node.id || node.nodeName,
        comp_style = msos.style.computed(node),

        parse_bl = comp_style['border-left-width']		|| comp_style['borderLeftWidth']	|| 0,
        parse_bt = comp_style['border-top-width']		|| comp_style['borderTopWidth']		|| 0,
        parse_br = comp_style['border-right-width']		|| comp_style['borderRightWidth']	|| 0,
        parse_bb = comp_style['border-bottom-width']	|| comp_style['borderBottomWidth']	|| 0;

    be_obj = {
        l: parseInt(parse_bl, 10) || 0,
        t: parseInt(parse_bt, 10) || 0,
        r: parseInt(parse_br, 10) || 0,
        b: parseInt(parse_bb, 10) || 0
    };

    be_obj.w = be_obj.l + be_obj.r;
    be_obj.h = be_obj.t + be_obj.b;

    if (msos.config.verbose) {
        msos.console.debug('msos.position.get_border_extent -> for: ' + node_name, be_obj);
    }
    return be_obj;
};