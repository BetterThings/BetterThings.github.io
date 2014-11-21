// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.resizable");
msos.require("jquery.ui.resizable");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: resizable.html loaded!');

        jQuery('#widget_head').addClass('ui-widget-header');
        jQuery("#resizable").addClass('ui-widget ui-widget-content').resizable();
    }
);