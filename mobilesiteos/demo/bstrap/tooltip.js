// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.tooltip");
msos.require("bootstrap.tooltip");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: tooltip.html loaded!');

        // Tooltip demo
        jQuery('#tooltip-demo').find('a[data-toggle=tooltip]').tooltip();
        jQuery('#tooltip-placement').find('button').tooltip();
    }
);