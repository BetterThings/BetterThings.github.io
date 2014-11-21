// Copyright Notice:
//					debug.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile popup debug div functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.debug");
msos.require("msos.popdiv");

msos.debug.version = new msos.set_version(14, 3, 10);


// Start by loading our pop_debug.css stylesheet
msos.debug.css = new msos.loader();
msos.debug.css.load('pop_debug_css', msos.resource_url('css', 'pop_debug.css'));

// Hide Google Web Translate "original text" popup
msos.config.google.no_translate.by_id.push('#debug_header');

msos.debug.create_popup = function () {
    "use strict";

    var temp_dbug = 'msos.debug.create_popup',
        tool_name = 'msos_debug',
        debug_pop_obj = this;

    msos.console.debug(temp_dbug + ' -> start.');

    // Create our standard 'tool' parameters (most aren't needed here)
    this.tool_name = tool_name;
    this.tool_target = null;
    this.tool_iframe = null;
    this.tool_created = false;
    this.tool_on_success = [];
    this.tool_on_complete = [];
    this.tool_load_url = '';
    this.tool_loaded_url = '';
    this.tool_dialog = {};
    this.tool_popup = new msos.popdiv.create_tool(
		tool_name, '_dbg',
		msos.resource_url('css', 'size'),
		msos.byid("debug_container"),		// Popup container element (dragable)
		msos.byid("debug_header"),			// Popup control element (typ. header or footer)
		msos.byid("debug_close"),			// Popup close button element
		msos.byid("debug_display"),			// Popup display element
		{
            of: jQuery('#body'),
            my: 'left top',
            at: 'left+20 top+120',
            collision: 'none'
        }									// Popup position relative to window
    );

    this.tool_on_ready = function () { return true; };
	this.tool_append_output = false;

    this.text_input = function (text) {

		var debug_display = jQuery('#debug_display');

        if (!debug_pop_obj.tool_popup.visibile) {
            debug_pop_obj.tool_popup.display_popdiv();
        }

        // Add our debugging text
		if (debug_pop_obj.tool_append_output === true) {
			debug_display.append('<pre>' + text + '</pre>');
		} else {
			debug_display.html('<pre>' + text + '</pre>');
		}

        debug_pop_obj.tool_popup.filled = true;

        if (msos.config.verbose) {
            msos.console.debug(temp_dbug + ' - text_input -> filled.');
        }

        // Make sure html is loaded
        setTimeout(debug_pop_obj.tool_on_ready, 100);
    };

    msos.console.debug(temp_dbug + ' -> done!');
};

msos.debug.event_text = function (evt, text) {
    "use strict";

    var txt = 'no event',
        tag = 'na';

    if (evt) {
        if (evt.type) {
            txt = evt.type;
        } else {
            txt = 'no type';
        }
        if (evt.target) {
            tag = 'node type = ' + evt.target.nodeName.toLowerCase();
            if (evt.target.id) {
                tag += "\ntarget id = " + evt.target.id;
            }
        } else {
            tag = 'no target';
        }
    }
    if (text) {
        tag += "\n" + text;
    }
    txt = "Event = " + txt + "\n" + tag;
    return txt;
};

msos.debug.event = function (evt, text) {
    "use strict";

    var debug_txt = msos.debug.event_text(evt, text);

    msos.debug.write(debug_txt);
};

msos.debug.timing = function () {
	"use strict";

	var rt = msos.record_times;

	rt.base_delta = rt.base_timeEnd - rt.base_time;
	rt.config_delta = rt.config_timeEnd - rt.config_time;
	if (rt.bundle_time) {
		rt.bundle_delta = rt.bundle_timeEnd - rt.bundle_time;
	}
	rt.core_delta = rt.core_timeEnd - rt.core_time;
	rt.run_onload_delta = rt.run_onload_timeEnd - rt.run_onload_time;

	msos.debug.write(JSON.stringify(rt, null, '\t'));
};

msos.debug.gen_input = function (elm, elm_prog_obj) {
    "use strict";

    var obj = '',
        temp_text = '';

	if (!elm_prog_obj || !elm_prog_obj.debug) {
		msos.console.warn('msos.debug.gen_input -> missing element program object!');
		return '';
	}

    for (obj in elm_prog_obj) {
		if (obj === 'debug') { continue; }
        if (obj !== 'cmd' || obj !== 'state' || obj !== 'element' || obj !== 'debug') {
            elm_prog_obj.debug.push(obj + ': ' + elm_prog_obj[obj]);
        }
    }
    if (elm.value) {
        elm_prog_obj.debug.push("value: " + elm.value);
    }
    if (elm.className) {
        elm_prog_obj.debug.push("class: " + elm.className);
    }

    temp_text = elm_prog_obj.debug.join("\n");

    // Get debug ready for next event
    elm_prog_obj.debug = [];

    return temp_text;
};

msos.debug.write = function (text, append) {
    "use strict";

	var temp_dw = 'msos.debug.write -> ',
		tool = msos.debug.get_tool();

	if (msos.config.verbose) {
		msos.console.debug(temp_dw + 'called.');
	}

	if (append === true)	{ tool.tool_append_output = true; }
	else					{ tool.tool_append_output = false; }

    if (tool) {
        tool.text_input(text);
    } else {
		msos.console.error(temp_dw + 'tool missing!');
	}
};

msos.debug.add_to_page = function () {
    "use strict";

    var container = jQuery(
			'<div id="debug_container" class="msos_popup">'
		 +		'<div id="debug_header" class="header_popup">'
         +			'<button id="debug_close" class="btn btn-danger btn-small fa fa-times"></button>'
         +		'</div>'
		 +		'<div id="debug_display"></div>'
		 + '</div>'
		),
		debug_obj;

    jQuery('body').append(container);

	// Create our debug popup
	debug_obj = new msos.debug.create_popup();

    // Register our debug popup div
    msos.popdiv.register_tool(debug_obj);

    // Add auto close
    jQuery('#body').click(debug_obj.tool_popup.popup_auto_hide);

    debug_obj.tool_created = true;
};

msos.debug.get_tool = function () {
    "use strict";

    if (!msos.registered_tools.msos_debug) { msos.debug.add_to_page(); }

    return msos.registered_tools.msos_debug.base;
};