// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.dialog");
msos.require("jquery.ui.dialog");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: dialog.html loaded!');

		jQuery("#dialog").dialog();
    }
);