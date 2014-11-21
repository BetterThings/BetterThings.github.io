// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.popover");
msos.require("bootstrap.popover");
msos.require("bootstrap.alert");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: popover.html loaded!');

        // popover demo
        jQuery("a[data-po=popover]").popover({ 'placement' : 'bottom' });

    }
);