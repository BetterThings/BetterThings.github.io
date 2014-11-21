// Copyright Notice:
//				    pyromane.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'FireBug' inspired mobile debugging console (just the basics)

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.pyromane");
msos.require("msos.common");
msos.require("msos.stickup");


msos.pyromane.version = new msos.set_version(14, 2, 17);


msos.pyromane.output_obj_store = {};
msos.pyromane.output_obj_idx = 0;
msos.pyromane.jquery_obj_log = null;

// Start by loading our pyromane stylesheet
msos.pyromane.css = new msos.loader();
msos.pyromane.css.load('pyromane_css', msos.resource_url('css', 'pyromane.css'));


// --------------------------
// Helper functions
// --------------------------
msos.pyromane.is_node = function (obj) {
    "use strict";

    return (typeof window.Node === "object" ? obj instanceof window.Node : typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string");
};

msos.pyromane.obj_type = function (obj) {
    "use strict";

    return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1];
};

msos.pyromane.get_func_text = function (text) {
    "use strict";

    if (jQuery.isFunction(text)) {
        return function (i) {
            var self = jQuery(this);
            self.text(text.call(this, i, self.text()));
        };
    }
    return jQuery.text(this);
};

msos.pyromane.format_output = function (in_array) {
    "use strict";

    var output = [],
        format = in_array[0],
        arry_idx = 0,
        parsed = [],
        i = 0,
        item, object;

    if (typeof format !== "string") {
        format = '';
        arry_idx = -1;
    }
    if (format) {
        parsed = msos.pyromane.parse_format(format);

        for (i = 0; i < parsed.length; i += 1) {
            item = parsed[i];
            if (item && typeof item === "object") {
                arry_idx += 1;
                item.out_map(in_array[arry_idx], output);
            } else {
                msos.pyromane.output_text(item, output);
            }
        }
    }
    for (i = arry_idx + 1; i < in_array.length; i += 1) {
        object = in_array[i];
        msos.pyromane.define_type(object, output);
    }
    return output;
};


msos.pyromane.parse_format = function (format) {
    "use strict";

    var parsed = [],
        reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/,
        map_to = {
            s: msos.pyromane.output_text,
            d: msos.pyromane.output_num,
            i: msos.pyromane.output_num,
            f: msos.pyromane.output_num
        },
        m = 0,
        type, mapped;

    for (m = reg.exec(format); m; m = reg.exec(format)) {
        type = m[8] || m[5];
        mapped =  map_to.hasOwnProperty(type) ? map_to[type] : msos.pyromane.define_type;

        parsed.push(format.substr(0, m[0][0] === "%" ? m.index : m.index + 1));
        parsed.push({
            out_map: mapped
        });

        format = format.substr(m.index + m[0].length);
    }

    parsed.push(format);
    return parsed;
};

msos.pyromane.define_type = function (obj, out) {
    "use strict";

    var general = msos.pyromane.output_gen;

    if (obj === undefined) {
        general(obj, out, 'pyro_obj_null');
    } else if (obj === null) {
        general(obj, out, 'pyro_obj_null');
    } else if (typeof obj === "string") {
        general(obj, out, 'pyro_obj_string');
    } else if (typeof obj === "number") {
        general(obj, out, 'pyro_obj_number');
    } else if (obj instanceof Date) {
        general(obj, out, 'pyro_obj_date');
    } else if (obj instanceof Error) {
        general(obj, out, 'pyro_obj_error');
    } else if (typeof obj === "function") {
        msos.pyromane.output_obj(obj, out, 'pyro_obj_func');
    } else if (typeof obj === "object") {
        msos.pyromane.output_obj(obj, out, 'pyro_obj_object');
    } else {
        msos.pyromane.output_text(obj, out);
    }
};

msos.pyromane.output_text = function (obj, out) {
    "use strict";

    var scrubbed = msos.common.escape_html(msos.pyromane.obj_to_string(obj)) || '';

    if (scrubbed) {
        out.push(scrubbed);
    }
};

msos.pyromane.output_gen = function (obj, out, class_name) {
    "use strict";

    var type = msos.pyromane.obj_type(obj),
        scrubbed = msos.common.escape_html(msos.pyromane.obj_to_string(obj)) || '';

    if (scrubbed) {
        out.push('<span class="' + class_name + '">[ ' + type + ':', scrubbed, ']</span>');
    }
};

msos.pyromane.output_obj = function (obj, out, class_name) {
    "use strict";

    var type = msos.pyromane.obj_type(obj),
        id = '';

    if (_.isEmpty(obj)) {
        type = 'Empty';
        class_name = 'pyro_obj_empty';
    } else if (msos.pyromane.is_node(obj)) {
        // Check if object is a DOM node
        if (obj.nodeType === 1) {
            type = 'DOM';
        } else if (obj.nodeType === 9) {
            type = 'XML';
        } else if (obj.nodeType === 3) {
            msos.pyromane.output_gen(obj, out, 'pyro_obj_text');
            return;
        }
    }

    id = type + '_' + msos.pyromane.output_obj_idx;
    msos.pyromane.output_obj_idx += 1;

    out.push('<span id="' + id + '" class="' + class_name + '">[', type, ']</span>');

    msos.pyromane.output_obj_store[id] = obj;
};

msos.pyromane.obj_to_string = function (obj) {
    "use strict";

    if (typeof obj !== 'string') {
        return String(obj) || '';
    }

    return obj;
};

msos.pyromane.write_msg = function () {
    "use strict";

    var message = [],
        msg_txt = 'msos.pyromane.write_msg -> ',
        form_out = msos.pyromane.format_output,
        i = 0,
        type = '',
        console_array = [];

    if (msos.config.verbose) {
        msos.console.debug(msg_txt + 'start.');
    }

    for (i = 0; i < msos.console.queue.length; i += 1) {

        console_array = msos.console.queue[i];
        type = console_array.shift();
        message = form_out(console_array);

        msos.pyromane.write_row(type, message);
    }

    // Clear queue to accomodate new input
    msos.console.queue = [];

    if (msos.config.verbose) {
        if (console && console.log) {
            console.log(msg_txt, 'done!');
        }
        msos.pyromane.write_row('debug', [msg_txt, 'done!']);
    }
};

msos.pyromane.write_row = function (type, message) {
    "use strict";

    var temp_row = message.join(' '),
        row = jQuery('<div title="' + type + '">' + temp_row + '</div>');

    row.addClass('pyro_' + type);

    msos.pyromane.jquery_obj_log.append(row);
};

msos.pyromane.debug_dump = function () {
    "use strict";

    var dmp_txt = 'msos.pyromane.debug_dump -> ',
        obj_cache = [],
        obj_types = {
            Object: [],
            DOM: [],
            XML: [],
            String: [],
            Array: [],
            Function: []
        },
        type = '',
        type_selector = '',
        type_spans = [],
        i = 0,
        obj_elm = null,
        obj_id = '',
        recursive = 0,
        filter = function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (obj_cache.indexOf(value) !== -1) {
                    // Circular reference found
                    msos.console.warn(dmp_txt + 'recursive object: ' + key);
                    recursive += 1;
                    if (recursive > 20) {
                        throw new Error('Too many recursive objects for output (ref. msos.pyromane)');
                    }
                    return '[object Recursive]';
                }
                // Store value to check against
                obj_cache.push(value);
            }
            return value;
        };

    for (type in obj_types) {
        type_selector = "span[id^=" + type + "_]";
        type_spans = jQuery(type_selector) || [];
        for (i = 0; i < type_spans.length; i += 1) {
            obj_elm = type_spans[i];
            obj_id = obj_elm.id || '';
            if (obj_id) {
                jQuery('#' + obj_id).click(

                function (evt) {
                    msos.do_nothing(evt);
                    var obj_dump = '',
                        obj_to_dump = msos.pyromane.output_obj_store[this.id];

                    if (typeof obj_to_dump === 'function') {
                        obj_dump = obj_to_dump.toString();
                    } else {
                        // Clear cache for each new run
                        obj_cache = [];
                        recursive = 0;
                        obj_dump = JSON.stringify(obj_to_dump, filter, '\t');
                        if (recursive > 2) {
                            msos.notify.info('There are ' + recursive + ' recursive objects in this objects output!', 'Please note:');
                        }
                    }
                    obj_dump = msos.common.escape_html(obj_dump);
                    msos.debug.write(obj_dump);
                });
                jQuery('#' + obj_id).css('cursor', 'pointer');
            }
        }
    }
};

msos.pyromane.show = function () {
    "use strict";

    jQuery('#pyromane').fadeIn('slow');
};

msos.pyromane.hide = function () {
    "use strict";

    jQuery('#pyromane').fadeOut('fast');
};

msos.pyromane.clear = function (evt) {
    "use strict";

    msos.do_nothing(evt);

    // Clear queue to accomodate new input
    msos.console.queue = [];

    jQuery('#pyromane').fadeOut(
        'slow',
        function () {
            msos.pyromane.jquery_obj_log.empty();
            msos.stickup.update();
            msos.pyromane.show();
        }
    );
};

msos.pyromane.toggle = function (evt) {
    "use strict";

    msos.do_nothing(evt);

    var css_display = msos.pyromane.jquery_obj_log.css('display');

    msos.pyromane.jquery_obj_log.css('display', (css_display !== 'block' ? "block" : "none"));

    // Reset sticky elements
    msos.stickup.update();
};

msos.pyromane.page = function (evt) {
    "use strict";

    msos.do_nothing(evt);

    var body_container = jQuery('#body'),
        css_display = body_container.css('display');

    body_container.css('display', (css_display !== 'block' ? "block" : "none"));

    // Reset sticky elements
    msos.stickup.update();
};

msos.pyromane.setup = function () {
    "use strict";

    msos.console.debug("msos.pyromane.setup -> start.");

    var fill_li = function (button, title, method) {
            return "<li><button class='btn btn-msos' id='pyromane_" + method + "' title='" + title + "'>" + button + '</button></li>';
        },
        container = jQuery("<div id='pyromane'></div>"),
        temp_html = '';

    jQuery('body').append(container);

    temp_html =
        '<div id="pyromane_toolbar" class="msos_navbar">'
        + '  <ul class="pyromane_tabs">'
                + fill_li("Clear Log", "Clear console log data", "clear")
                + fill_li("Toggle Log", "Show/hide console log", "toggle")
                + fill_li("Toggle Page", "Show/hide current page", "page")
        + '  </ul>'
        + '</div>'
        + '<div class="msos_width" id="pyromane_log"></div>';

    // Works in Chrome for 'xhmtl5'
    container.html(temp_html);

    jQuery('body').append(container);

     jQuery('#pyromane_clear').click(msos.pyromane.clear);
    jQuery('#pyromane_toggle').click(msos.pyromane.toggle);
      jQuery('#pyromane_page').click(msos.pyromane.page);

    // Store jQuery node object for repetitive use
    msos.pyromane.jquery_obj_log = jQuery('#pyromane_log');

    // Create our stickuup element
    msos.stickup.create(jQuery('#pyromane_toolbar'));

    msos.console.debug("msos.pyromane.setup -> done!");
};

msos.pyromane.run = function () {
    "use strict";

	msos.pyromane.write_msg();

    // Add object debugging if 'msos.debug' was loaded
	if (msos.debug) { msos.pyromane.debug_dump(); }

	setTimeout(msos.pyromane.show, 1000);
};


msos.onload_func_start.push(msos.pyromane.setup);
