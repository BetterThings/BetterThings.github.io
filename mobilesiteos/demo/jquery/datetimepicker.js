// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.datetimepicker");
msos.require("jquery.ui.datetimepicker");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: datetimepicker.html loaded!');

		jQuery( "#datetimepicker" ).datetimepicker({
			ampm: true
		});
    }
);