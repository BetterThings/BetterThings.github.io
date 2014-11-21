// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.sortable");
msos.require("jquery.ui.sortable");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: sortable.html loaded!');

        jQuery("#sortable").sortable();
        jQuery("#sortable").disableSelection();
    }
);