// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.draggable");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: draggable.html loaded!');

        jQuery("#draggable").draggable();
    }
);