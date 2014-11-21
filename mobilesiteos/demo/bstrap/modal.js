// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.modal");
msos.require("bootstrap.modal");
msos.require("bootstrap.popover");  // popover.js calls tooltip.js code by default (MSOS)


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: modal.html loaded!');

        jQuery('.tooltip-test').tooltip();
        jQuery('.popover-test').popover();
    }
);