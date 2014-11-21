// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.datepicker");
msos.require("jquery.ui.datepicker");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: datepicker.html loaded!');

		jQuery("#datepicker").datepicker();

    }
);