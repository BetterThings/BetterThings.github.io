// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.debugging");
msos.require("msos.debugform");
msos.require("msos.i18n");
msos.require("msos.intl");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: debugging.html loaded!');

		msos.debugform.add(jQuery('#msos_debugging'));
	}
);