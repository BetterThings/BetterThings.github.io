// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.timepicker");
msos.require("jquery.ui.timepicker");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Page: timepicker.html loaded!');

        jQuery("#timepicker").timepicker();
    }
);