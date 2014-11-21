// Copyright Notice:
//				    json/check.js
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.json.check");

msos.json.check.version = new msos.set_version(13, 6, 14);


msos.json.check.input = function (text) {
    "use strict";

    var temp_jc = 'msos.json.check.input -> ',
        out_bool = false;

    msos.console.debug(temp_jc + 'start.');

    if (/^[\],:{}\s]*$/
        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        msos.console.debug(temp_jc + 'valid JSON text.');
        out_bool = true;
    } else {
        msos.console.warn(temp_jc + 'not valid JSON text.');

        if (msos.debug) { msos.debug.write(text); }
    }

    msos.console.debug(temp_jc + 'done!');
    return out_bool;
};