// Copyright Notice:
//				    iframe.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile several 'iframe' related helper functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.iframe");
msos.require("msos.common");

msos.iframe.version = new msos.set_version(14, 3, 17);


// --------------------------
// Iframe event helper functions
// --------------------------
msos.iframe.event_target = function (ev) {
    "use strict";

    var targ = null;

    if (ev.target) {
        targ = ev.target;
    } else if (ev.srcElement) {
        targ = ev.srcElement;
    }

    if (targ && targ.nodeType === 3) {
        targ = targ.parentNode;
    }
    return targ;
};


// --------------------------
// Iframe tool event bundling functions
// --------------------------
msos.iframe.set_event = function (tool_obj, iframe_array, add_event, add_function) {
    "use strict";

    var temp_set = 'msos.iframe.set_event -> ',
        temp_add = '.',
        iframe_onload = null,
        reg_iframe = null,
        i = 0;

    iframe_onload = function () {

        var register_ifr = this,
            input_mousedown = function () {
                tool_obj.tool_target = null;
                tool_obj.tool_iframe = null;
            },
            input_mouseup = function (evt) {
                tool_obj.tool_target = msos.iframe.event_target(evt);
                tool_obj.tool_iframe = register_ifr;
                if (msos.debug) {
                    msos.debug.event(evt, "\n" + temp_set + "Iframe mouseup :\ntool target -> " + (tool_obj.tool_target.id || tool_obj.tool_target.nodeName));
                }
            },
            iframe_win = register_ifr.contentWindow,
            iframe_doc = iframe_win.document;

        // Set Editable before we add events
        iframe_doc.designMode = 'on';

        //$('#iframe_id').contentDocument.keydown
        jQuery(iframe_win).bind('mousedown', input_mousedown);
        jQuery(iframe_win).bind('mouseup', input_mouseup);

        if (add_event && add_function && typeof (add_function === 'function')) {
            jQuery(iframe_win).bind(add_event, add_function);
            temp_add = ' with additional event: ' + add_event;
        }
        msos.console.debug(temp_set + register_ifr.id + ': registered' + temp_add);
    };

    msos.console.debug(temp_set + 'start.');

    for (i = 0; i < iframe_array.length; i += 1) {

        reg_iframe = jQuery(iframe_array[i]);

        if (msos.common.valid_jq_node(reg_iframe, 'iframe')) { reg_iframe.load(iframe_onload); }
    }

    msos.console.debug(temp_set + 'done!');
};