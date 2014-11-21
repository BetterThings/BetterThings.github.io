// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.selectable");
msos.require("jquery.ui.selectable");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: selectable.html loaded!');

        jQuery("#selectable").selectable();
    }
);