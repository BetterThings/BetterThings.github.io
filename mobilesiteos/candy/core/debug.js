/*global
    msos: false,
    jQuery: false,
    candy: false,
    utils: false
*/

msos.provide("candy.core.debug");

if (candy.wrapper.use_popup_debug) {
    // This is for desktop only
    msos.require("msos.xml.prettify");
    msos.require("msos.popwindesktop");
} else if (candy.wrapper.use_xml_to_json) {
    // Works for msos.pyromane too!
    msos.require("jquery.tools.xml2json");
}

candy.core.debug.version = new msos.set_version(13, 6, 25);


candy.core.debug._collected_data = '';
candy.core.debug._collected_count = 0;

candy.core.debug.strophe_recv = function (data) {
    "use strict";

    var xml_obj;

    if (candy.wrapper.use_popup_debug) {
        data = "\nRECV:\n" + msos.xml.prettify(data);
        candy.core.debug.popup_out(data);
        msos.console.debug('candy.core.debug.strophe_recv <<<< comm. ref: ' + candy.core.debug._collected_count);
    } else if (candy.wrapper.use_xml_to_json) {
        xml_obj = jQuery.xml2json(data);
        msos.console.debug('candy.core.debug.strophe_recv <<<< xml-to-json:', xml_obj);
    }else {
        msos.console.debug('candy.core.debug.strophe_recv:');
        msos.console.debug('<<<<');
        msos.console.debug(data);
        msos.console.debug('<<<<');
    }
};

candy.core.debug.strophe_sent = function (data) {
    "use strict";

    var xml_obj;

    candy.core.debug._collected_count += 1;

    if (candy.wrapper.use_popup_debug) {
        data = "\n\n=========== (" + candy.core.debug._collected_count + ")\nSENT:\n" + msos.xml.prettify(data);
        candy.core.debug.popup_out(data);
        msos.console.debug('candy.core.debug.strophe_sent >>>> comm. ref: ' + candy.core.debug._collected_count);
    } else if (candy.wrapper.use_xml_to_json) {
        xml_obj = msos.xml.tojson(data);
        msos.console.debug('candy.core.debug.strophe_sent >>>> xml-to-json:', xml_obj);
    } else {
        msos.console.debug('candy.core.debug.strophe_sent:');
        msos.console.debug('>>>>');
        msos.console.debug(data);
        msos.console.debug('>>>>');
    }
};

candy.core.debug.popup_out = function (data) {
    "use strict";

    candy.core.debug._collected_data += data;

    if (msos.popwindesktop.debug_window) {
        msos.popwindesktop.debug_write(candy.core.debug._collected_data);
    }
    if (msos.popwindesktop.debug_window
     && msos.popwindesktop.debug_window.input_ready) {
        candy.core.debug._collected_data = '';
    }
};

candy.core.debug.strophe_comm = function () {
    "use strict";

    if (msos.config.debug && candy.wrapper.use_popup_debug) {
        msos.popwindesktop.start_debug_window();
        msos.popwindesktop.debug_window.input_clear = false;
        // Never ready in time, so cache output in 'candy.core.debug._collected_data' and skip warning
        msos.popwindesktop.debug_suppress_warn = true;
        setTimeout(
            function () {
                if (candy.core.debug._collected_data) {
                    candy.core.debug.popup_out('');
                }
            },
            3000
        );
    }
};